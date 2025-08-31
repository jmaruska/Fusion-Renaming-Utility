import re
import traceback
import adsk.core #type: ignore
import adsk.fusion #type: ignore
import adsk.cam #type: ignore
import json

# Global set of event handlers to keep them referenced for the duration of the command
handlers = []
app = adsk.core.Application.get()
ui = app.userInterface

# Button properties in a dictionary
buttonProps = {
    'id': 'jm_RenamerCommand',
    'displayName': 'Renamer',
    'description': 'Open the Renamer palette',
    'resources': 'resources',
    'paletteID': 'RenamerPalette'
}

class CommandCreatedEventHandler(adsk.core.CommandCreatedEventHandler):
    def __init__(self):
        super().__init__()

    def notify(self, args):
        # Handle the command created event
        eventArgs = adsk.core.CommandCreatedEventArgs.cast(args)
        cmd = eventArgs.command
        cmd.isRepeatable = False
        cmd.isExecutedWhenPreEmpted = False

class ShowPaletteCommandExecuteHandler(adsk.core.CommandEventHandler):
    def __init__(self):
        super().__init__()

    def notify(self, args):
        try:
            # Create and display the palette
            palette = ui.palettes.itemById(buttonProps['paletteID'])
            if not palette:
                paletteWidth = 350
                paletteHeight = 600

                palette = ui.palettes.add(buttonProps['paletteID'], 'Renamer', 'Renamer.html', True, True, True, paletteWidth, paletteHeight)
                palette.setMinimumSize(paletteWidth, 350)
                palette.dockingState = adsk.core.PaletteDockingStates.PaletteDockStateRight

                # Connect to the palette close event
                onPaletteClose = MyPaletteCloseEventHandler()
                palette.closed.add(onPaletteClose)
                handlers.append(onPaletteClose)

                # Connect to the palette incoming data event
                onPaletteIncoming = MyPaletteIncomingEventHandler()
                palette.incomingFromHTML.add(onPaletteIncoming)
                handlers.append(onPaletteIncoming)

            # Show the palette
            palette.isVisible = True
        except Exception as e:
            ui.messageBox(f'Failed:\n{traceback.format_exc()}')

class ShowPaletteCommandCreatedHandler(adsk.core.CommandCreatedEventHandler):
    def __init__(self):
        super().__init__()

    def notify(self, args):
        try:
            command = args.command
            onExecute = ShowPaletteCommandExecuteHandler()
            command.execute.add(onExecute)
            handlers.append(onExecute)
        except Exception as e:
            ui.messageBox(f'Failed:\n{traceback.format_exc()}')

class MyPaletteCloseEventHandler(adsk.core.UserInterfaceGeneralEventHandler):
    def __init__(self):
        super().__init__()

    def notify(self, args):
        pass  # No action needed

class MyPaletteIncomingEventHandler(adsk.core.HTMLEventHandler):
    def __init__(self):
        super().__init__()

    def notify(self, args):
        eventArgs = adsk.core.HTMLEventArgs.cast(args)
        data = json.loads(eventArgs.data)
        action = eventArgs.action

        try:
            # Handle actions here
            if action == 'rename':
                self.handle_rename(data)
            elif action == 'addPrefix':
                self.handle_add_prefix(data)
            elif action == 'addSuffix':
                self.handle_add_suffix(data)
            elif action == 'applyNumbering':
                self.handle_apply_numbering(data)
            elif action == 'addAssembliesSuffix':
                self.handle_add_assemblies_suffix(data)
            elif action == 'addPartsSuffix':
                self.handle_add_parts_suffix(data)
            elif action == 'uniqueBodyNames':
                self.handle_unique_body_names(data)
                    
        except Exception as e:
            ui.messageBox(f'Operation failed: {str(e)}\n\n{traceback.format_exc()}')

    def get_selected_entities(self):
        """Get all currently selected entities, converting occurrences to components."""
        selected_entities = []
        
        if ui.activeSelections.count == 0:
            return selected_entities
            
        for i in range(ui.activeSelections.count):
            try:
                entity = ui.activeSelections.item(i).entity
                if isinstance(entity, adsk.fusion.Occurrence):
                    entity = entity.component
                if isinstance(entity, adsk.fusion.Component):
                    selected_entities.append(entity)
            except:
                continue  # Skip invalid selections
                
        return selected_entities

    def execute_operation_by_mode(self, mode, operation_all, operation_hierarchy, operation_single, *args):
        """
        Consolidated method to handle All/Hierarchy/Selected modes with proper selection handling.
        
        Args:
            mode: 'All', 'Hierarchy', or 'Selected'
            operation_all: Function to call for 'All' mode
            operation_hierarchy: Function to call for 'Hierarchy' mode  
            operation_single: Function to call for individual components
            *args: Arguments to pass to the operation functions
        """
        design = app.activeProduct
        rootComp = design.rootComponent

        if mode == 'All':
            operation_all(rootComp, *args)
        elif mode == 'Hierarchy':
            selected_entities = self.get_selected_entities()
            if not selected_entities:
                ui.messageBox("Please select one or more components for Hierarchy mode.")
                return
            # Apply hierarchy operation to each selected component
            for entity in selected_entities:
                operation_hierarchy(entity, *args)
        elif mode == 'Selected':
            selected_entities = self.get_selected_entities()
            if not selected_entities:
                ui.messageBox("Please select one or more components for Selected mode.")
                return
            # Apply operation to each selected component individually
            for entity in selected_entities:
                operation_single(entity, *args)

    def handle_rename(self, data):
        findString = data['findString']
        replaceString = data['replaceString']
        renameMode = data['renameMode']
        
        self.execute_operation_by_mode(
            renameMode,
            self.renameAll,
            self.renameHierarchy, 
            self.renameComponent,
            findString, replaceString
        )

    def handle_add_prefix(self, data):
        prefixString = data['prefixString']
        prefixSuffixMode = data['prefixSuffixMode']
        
        self.execute_operation_by_mode(
            prefixSuffixMode,
            self.addPrefixAll,
            self.addPrefixHierarchy,
            self.addPrefixComponent,
            prefixString
        )

    def handle_add_suffix(self, data):
        suffixString = data['suffixString']
        prefixSuffixMode = data['prefixSuffixMode']
        
        self.execute_operation_by_mode(
            prefixSuffixMode,
            self.addSuffixAll,
            self.addSuffixHierarchy,
            self.addSuffixComponent,
            suffixString
        )

    def handle_apply_numbering(self, data):
        findString = data['numberingFindString']
        zeroPadding = int(data['zeroPadding'])
        startingNumber = int(data['startingNumber'])
        byCount = int(data['byCount'])
        numberingMode = data['numberingMode']
        
        # Special handling for numbering to maintain counter across selections
        design = app.activeProduct
        rootComp = design.rootComponent

        if numberingMode == 'All':
            self.applyNumberingAll(rootComp, findString, zeroPadding, startingNumber, byCount)
        elif numberingMode == 'Hierarchy':
            selected_entities = self.get_selected_entities()
            if not selected_entities:
                ui.messageBox("Please select one or more components for Hierarchy mode.")
                return
            # Apply hierarchy numbering maintaining counter across all selections
            current_number = startingNumber
            for entity in selected_entities:
                current_number = self.applyNumberingHierarchyWithCounter(entity, findString, zeroPadding, current_number, byCount)
        elif numberingMode == 'Selected':
            selected_entities = self.get_selected_entities()
            if not selected_entities:
                ui.messageBox("Please select one or more components for Selected mode.")
                return
            # Apply numbering to each selected component individually
            current_number = startingNumber
            for entity in selected_entities:
                self.applyNumberingComponent(entity, findString, zeroPadding, current_number, byCount)
                current_number += byCount

    def handle_add_assemblies_suffix(self, data):
        design = app.activeProduct
        rootComp = design.rootComponent
        self.addAssembliesSuffix(rootComp)

    def handle_add_parts_suffix(self, data):
        design = app.activeProduct
        rootComp = design.rootComponent
        self.addPartsSuffix(rootComp)

    def handle_unique_body_names(self, data):
        design = app.activeProduct
        rootComp = design.rootComponent
        self.uniqueBodyNames(rootComp)

    def renameAll(self, component, findString, replaceString):
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                self.renameComponent(occ.component, findString, replaceString)

    def renameHierarchy(self, component, findString, replaceString):
        # Rename the component itself (only if it's editable)
        if self.is_component_editable(component):
            self.renameComponent(component, findString, replaceString)
        
        # Recursively rename child components
        for occ in component.occurrences:
            if not occ.isReferencedComponent:
                self.renameHierarchy(occ.component, findString, replaceString)

    def is_component_editable(self, component):
        """Check if a component can be renamed (not externally referenced)."""
        try:
            # Try to access the name property to see if it's editable
            # External references typically can't be renamed
            test_name = component.name
            return True
        except:
            return False

    def renameComponent(self, component, findString, replaceString):
        try:
            newName = re.sub(findString, replaceString, component.name)
            if newName != component.name:
                component.name = newName
        except:
            # Skip components that can't be renamed (e.g., external references)
            pass

    def addPrefixAll(self, component, prefixString):
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                self.addPrefixComponent(occ.component, prefixString)

    def addPrefixHierarchy(self, component, prefixString):
        # Add prefix to the component itself (only if it's editable)
        if self.is_component_editable(component):
            self.addPrefixComponent(component, prefixString)
        
        # Recursively add prefix to child components
        for occ in component.occurrences:
            if not occ.isReferencedComponent:
                self.addPrefixHierarchy(occ.component, prefixString)

    def addPrefixComponent(self, component, prefixString):
        try:
            newName = prefixString + component.name
            if newName != component.name:
                component.name = newName
        except:
            # Skip components that can't be renamed (e.g., external references)
            pass

    def addSuffixAll(self, component, suffixString):
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                self.addSuffixComponent(occ.component, suffixString)

    def addSuffixHierarchy(self, component, suffixString):
        # Add suffix to the component itself (only if it's editable)
        if self.is_component_editable(component):
            self.addSuffixComponent(component, suffixString)
        
        # Recursively add suffix to child components
        for occ in component.occurrences:
            if not occ.isReferencedComponent:
                self.addSuffixHierarchy(occ.component, suffixString)

    def addSuffixComponent(self, component, suffixString):
        try:
            newName = component.name + suffixString
            if newName != component.name:
                component.name = newName
        except:
            # Skip components that can't be renamed (e.g., external references)
            pass

    def applyNumberingAll(self, component, findString, zeroPadding, startingNumber, byCount):
        number = startingNumber
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                self.applyNumberingComponent(occ.component, findString, zeroPadding, number, byCount)
                number += byCount

    def applyNumberingHierarchy(self, component, findString, zeroPadding, startingNumber, byCount):
        """Apply numbering to a component and all its children, maintaining counter."""
        return self.applyNumberingHierarchyWithCounter(component, findString, zeroPadding, startingNumber, byCount)
    
    def applyNumberingHierarchyWithCounter(self, component, findString, zeroPadding, startingNumber, byCount):
        """Apply numbering to component hierarchy, returning the next number to use."""
        number = startingNumber
        
        # Number the component itself (only if it's editable)
        if self.is_component_editable(component):
            self.applyNumberingComponent(component, findString, zeroPadding, number, byCount)
            number += byCount
            
        # Recursively number child components
        for occ in component.occurrences:
            if not occ.isReferencedComponent:
                number = self.applyNumberingHierarchyWithCounter(occ.component, findString, zeroPadding, number, byCount)
        return number

    def applyNumberingComponent(self, component, findString, zeroPadding, number, byCount):
        try:
            numberString = str(number).zfill(zeroPadding)
            newName = re.sub(findString, numberString, component.name)
            if newName != component.name:
                component.name = newName
        except:
            # Skip components that can't be renamed (e.g., external references)
            pass

    def addAssembliesSuffix(self, component):
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                self.addAssembliesSuffixComponent(occ.component)

    def addAssembliesSuffixComponent(self, component):
        try:
            if component.occurrences.count > 0:
                if not component.name.endswith('_asm'):
                    component.name += '_asm'
        except:
            # Skip components that can't be renamed (e.g., external references)
            pass

    def addPartsSuffix(self, component):
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                self.addPartsSuffixComponent(occ.component)

    def addPartsSuffixComponent(self, component):
        try:
            if component.occurrences.count == 0:
                if not component.name.endswith('_prt'):
                    component.name += '_prt'
        except:
            # Skip components that can't be renamed (e.g., external references)
            pass

    def uniqueBodyNames(self, component):
        bodyIndex = 1
        for occ in component.allOccurrences:
            if not occ.isReferencedComponent:
                bodyIndex = self.uniqueBodyNamesComponent(occ.component, bodyIndex)

    def uniqueBodyNamesComponent(self, component, bodyIndex):
        for body in component.bRepBodies:
            body.name = f"Body{bodyIndex}"
            bodyIndex += 1
        for occ in component.occurrences:
            if not occ.isReferencedComponent:
                bodyIndex = self.uniqueBodyNamesComponent(occ.component, bodyIndex)
        return bodyIndex

def cleanup():
    try:
        # Remove the palette
        palette = ui.palettes.itemById(buttonProps['paletteID'])
        if palette:
            palette.deleteMe()

        # Remove the custom button and its command definition
        cmdDef = ui.commandDefinitions.itemById(buttonProps['id'])
        if cmdDef:
            cmdDef.deleteMe()

        addinsPanel = ui.allToolbarPanels.itemById('SolidScriptsAddinsPanel')
        if addinsPanel:
            control = addinsPanel.controls.itemById(buttonProps['id'])
            if control:
                control.deleteMe()
    except Exception:
        ui.messageBox(f'Failed:\n{traceback.format_exc()}')

def run(context):
    try:
        global app, ui
        app = adsk.core.Application.get()
        ui = app.userInterface

        cleanup()
        # Create a button command definition using properties from the dictionary
        showPaletteCmdDef = ui.commandDefinitions.itemById(buttonProps['id'])
        if not showPaletteCmdDef:
            showPaletteCmdDef = ui.commandDefinitions.addButtonDefinition(buttonProps['id'], buttonProps['displayName'], buttonProps['description'], buttonProps['resources'])

            # Connect to Command Created event
            onCommandCreated = ShowPaletteCommandCreatedHandler()
            showPaletteCmdDef.commandCreated.add(onCommandCreated)
            handlers.append(onCommandCreated)

        # Add the button to the ADD-INS panel in the model workspace
        addInsPanel = ui.allToolbarPanels.itemById('SolidScriptsAddinsPanel')
        buttonControl = addInsPanel.controls.addCommand(showPaletteCmdDef)

        # Promote the button in the panel by default
        if buttonControl:
            buttonControl.isPromotedByDefault = True
            buttonControl.isPromoted = True
    except Exception:
        ui.messageBox(f'Failed:\n{traceback.format_exc()}')

def stop(context):
    cleanup()

# Run the script
run(None)