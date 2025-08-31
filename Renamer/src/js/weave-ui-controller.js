/**
 * Autodesk Weave UI Controller
 * 
 * Universal UI controller for Autodesk add-ins and applications.
 * Provides theme     const savedDensity = localStorage.getItem('weave-ui-density') || 'high';
    applyThemeAndDensity(savedTheme, savedDensity);
    
    // Initialize accordion functionality controls, and component state management
 * for Maya, Inventor, Fusion 360, AutoCAD, and other Autodesk product add-ins.
 * 
 * Usage: Include this script in any Autodesk add-in to get authentic Autodesk UI behavior.
 * The script automatically initializes and provides a clean API for programmatic control.
 * 
 * @version 1.0.0
 * @license MIT
 */

/**
 * Applies theme and density changes to the UI
 */
function applyThemeAndDensity(theme, density) {
    const body = document.body;
    
    // Get current theme and density from localStorage if not provided
    const currentTheme = theme || localStorage.getItem('weave-ui-theme') || 'light-gray';
    const currentDensity = density || localStorage.getItem('weave-ui-density') || 'high';
    
    // Remove existing theme classes
    body.classList.remove('theme-light-gray', 'theme-dark-gray', 'theme-dark-blue');
    body.classList.remove('density-high', 'density-medium');
    
    // Apply theme and density (always apply both to maintain state)
    if (currentTheme) body.classList.add(`theme-${currentTheme}`);
    if (currentDensity) body.classList.add(`density-${currentDensity}`);
    
    // Update radio buttons if they exist (for demo UI)
    if (currentTheme) {
        const themeRadio = document.querySelector(`input[name="weave-theme"][value="${currentTheme}"]`);
        if (themeRadio) themeRadio.checked = true;
    }
    
    if (currentDensity) {
        const densityRadio = document.querySelector(`input[name="weave-density"][value="${currentDensity}"]`);
        if (densityRadio) densityRadio.checked = true;
    }
    
    // Store in localStorage (always store both to maintain state)
    localStorage.setItem('weave-ui-theme', currentTheme);
    localStorage.setItem('weave-ui-density', currentDensity);
    
    // Update dropdown buttons to reflect current state
    const themeLabels = {
        'light-gray': 'Light Gray',
        'dark-gray': 'Dark Gray', 
        'dark-blue': 'Dark Blue'
    };
    
    const densityLabels = {
        'high': 'High Density',
        'medium': 'Medium Density'
    };
    
    // Update main theme dropdown
    const themeDropdownButton = document.querySelector('#theme-dropdown .adsk-dropdown-button span');
    if (themeDropdownButton && themeLabels[currentTheme]) {
        themeDropdownButton.textContent = themeLabels[currentTheme];
    }
    
    // Update main density dropdown  
    const densityDropdownButton = document.querySelector('#density-dropdown .adsk-dropdown-button span');
    if (densityDropdownButton && densityLabels[currentDensity]) {
        densityDropdownButton.textContent = densityLabels[currentDensity];
    }
    
    // Update demo theme dropdown
    const demoThemeDropdownButton = document.querySelector('#demo-theme-dropdown .adsk-dropdown-button span');
    if (demoThemeDropdownButton && themeLabels[currentTheme]) {
        demoThemeDropdownButton.textContent = themeLabels[currentTheme];
    }
    
    // Update demo density dropdown
    const demoDensityDropdownButton = document.querySelector('#demo-density-dropdown .adsk-dropdown-button span');
    if (demoDensityDropdownButton && densityLabels[currentDensity]) {
        demoDensityDropdownButton.textContent = densityLabels[currentDensity];
    }
    
    // Update demo title if it exists
    const demoTitle = document.getElementById('demo-title');
    if (demoTitle && currentTheme) {
        demoTitle.textContent = `Autodesk Weave UI - ${themeLabels[currentTheme]} Theme`;
    }
}

/**
 * Sync dropdown displays without changing theme/density classes
 */
function syncDropdownDisplays(theme, density) {
    const themeLabels = {
        'light-gray': 'Light Gray',
        'dark-gray': 'Dark Gray', 
        'dark-blue': 'Dark Blue'
    };
    
    const densityLabels = {
        'high': 'High Density',
        'medium': 'Medium Density'
    };
    
    // Update main theme dropdown
    const themeDropdownButton = document.querySelector('#theme-dropdown .adsk-dropdown-button span');
    if (themeDropdownButton && themeLabels[theme]) {
        themeDropdownButton.textContent = themeLabels[theme];
    }
    
    // Update main density dropdown  
    const densityDropdownButton = document.querySelector('#density-dropdown .adsk-dropdown-button span');
    if (densityDropdownButton && densityLabels[density]) {
        densityDropdownButton.textContent = densityLabels[density];
    }
    
    // Update demo theme dropdown
    const demoThemeDropdownButton = document.querySelector('#demo-theme-dropdown .adsk-dropdown-button span');
    if (demoThemeDropdownButton && themeLabels[theme]) {
        demoThemeDropdownButton.textContent = themeLabels[theme];
    }
    
    // Update demo density dropdown
    const demoDensityDropdownButton = document.querySelector('#demo-density-dropdown .adsk-dropdown-button span');
    if (demoDensityDropdownButton && densityLabels[density]) {
        demoDensityDropdownButton.textContent = densityLabels[density];
    }
    
    // Store current values in localStorage
    localStorage.setItem('weave-ui-theme', theme);
    localStorage.setItem('weave-ui-density', density);
}

/**
 * Message handler for external host app communication
 */
function handleHostAppMessage(event) {
    // Validate origin for security (configure for your host app)
    // if (event.origin !== 'expected-host-origin') return;
    
    try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (message.type === 'weave-ui-theme-change') {
            const { theme, density } = message.payload;
            applyThemeAndDensity(theme, density);
            
            // Dispatch event for add-in developers
            window.dispatchEvent(new CustomEvent('weave-host-theme-changed', {
                detail: { theme, density, source: 'host-app' }
            }));
        }
    } catch (error) {
        console.warn('Failed to parse host app message:', error);
    }
}

// Autodesk Weave UI - Theme and interaction controller
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const themeRadios = document.querySelectorAll('input[name="weave-theme"]');
    const densityRadios = document.querySelectorAll('input[name="weave-density"]');
    const appTitle = document.querySelector('[data-weave-title]') || document.getElementById('demo-title');
    
    const themeNames = {
        'light-gray': 'Light Gray',
        'dark-gray': 'Dark Gray', 
        'dark-blue': 'Dark Blue'
    };
    
    // Handle theme changes
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const currentDensity = AutodeskWeaveUI.getCurrentDensity();
                applyThemeAndDensity(this.value, currentDensity);
                
                // Dispatch custom event for add-in developers to listen to
                window.dispatchEvent(new CustomEvent('weave-theme-changed', {
                    detail: { theme: this.value, themeName: themeNames[this.value], source: 'user-ui' }
                }));
            }
        });
    });
    
    // Handle density changes
    densityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const currentTheme = AutodeskWeaveUI.getCurrentTheme();
                applyThemeAndDensity(currentTheme, this.value);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('weave-density-changed', {
                    detail: { density: this.value, source: 'user-ui' }
                }));
            }
        });
    });
    
    // Load saved theme and density preferences, but respect existing HTML classes
    const bodyElement = document.body;
    
    // Check if theme/density are already set in HTML
    const hasExistingTheme = bodyElement.classList.contains('theme-light-gray') || 
                            bodyElement.classList.contains('theme-dark-gray') || 
                            bodyElement.classList.contains('theme-dark-blue');
    
    const hasExistingDensity = bodyElement.classList.contains('density-high') || 
                              bodyElement.classList.contains('density-medium');
    
    // Get saved values for logging
    const savedTheme = localStorage.getItem('weave-ui-theme') || 'light-gray';
    const savedDensity = localStorage.getItem('weave-ui-density') || 'high';
    
    // Enable host app integration by default
    AutodeskWeaveUI.enableHostAppIntegration();
    
    // Initialize component behaviors FIRST
    setupParentChildCheckboxes();
    addUniversalInteractivity();
    
    // THEN apply theme and density after components are initialized
    // Only apply localStorage values if no existing classes are found
    if (!hasExistingTheme || !hasExistingDensity) {
        // Only apply theme if not already set in HTML
        const themeToApply = hasExistingTheme ? null : savedTheme;
        // Only apply density if not already set in HTML  
        const densityToApply = hasExistingDensity ? null : savedDensity;
        
        applyThemeAndDensity(themeToApply, densityToApply);
    } else {
        // Even if theme/density are set in HTML, we need to sync the dropdown displays
        const currentTheme = bodyElement.classList.contains('theme-light-gray') ? 'light-gray' :
                            bodyElement.classList.contains('theme-dark-gray') ? 'dark-gray' :
                            bodyElement.classList.contains('theme-dark-blue') ? 'dark-blue' : savedTheme;
        
        const currentDensity = bodyElement.classList.contains('density-high') ? 'high' :
                              bodyElement.classList.contains('density-medium') ? 'medium' : savedDensity;
        
        // Sync dropdown displays without changing classes
        syncDropdownDisplays(currentTheme, currentDensity);
    }
    
    // Tab switching for any tabs in the interface
    const tabs = document.querySelectorAll('.adsk-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('adsk-tab--active'));
            this.classList.add('adsk-tab--active');
            
            // Dispatch custom event for add-in developers
            window.dispatchEvent(new CustomEvent('weave-tab-changed', {
                detail: { activeTab: this.textContent.trim() }
            }));
        });
    });
    
    console.log('Autodesk Weave UI initialized with theme:', savedTheme, 'density:', savedDensity);
});

/**
 * Sets up parent-child checkbox relationships with indeterminate state support
 * Automatically detects checkboxes with data-weave-parent attribute
 */
function setupParentChildCheckboxes() {
    // Find all parent checkboxes (those that have children referencing them)
    const parentIds = [...new Set(
        Array.from(document.querySelectorAll('[data-weave-parent]'))
            .map(child => child.dataset.weaveParent)
    )];
    
    parentIds.forEach(parentId => {
        const parentCheckbox = document.getElementById(parentId);
        const childCheckboxes = document.querySelectorAll(`[data-weave-parent="${parentId}"]`);
        
        if (!parentCheckbox || childCheckboxes.length === 0) return;
        
        // Function to update parent state based on children
        function updateParentState() {
            const checkedChildren = Array.from(childCheckboxes).filter(cb => cb.checked);
            
            if (checkedChildren.length === 0) {
                parentCheckbox.checked = false;
                parentCheckbox.indeterminate = false;
            } else if (checkedChildren.length === childCheckboxes.length) {
                parentCheckbox.checked = true;
                parentCheckbox.indeterminate = false;
            } else {
                parentCheckbox.checked = false;
                parentCheckbox.indeterminate = true;
            }
            
            // Dispatch custom event for add-in developers
            window.dispatchEvent(new CustomEvent('weave-checkbox-group-changed', {
                detail: { 
                    parentId, 
                    checkedCount: checkedChildren.length, 
                    totalCount: childCheckboxes.length 
                }
            }));
        }
        
        // Parent checkbox click handler
        parentCheckbox.addEventListener('change', function() {
            const shouldCheck = this.checked;
            childCheckboxes.forEach(child => {
                child.checked = shouldCheck;
            });
            this.indeterminate = false;
        });
        
        // Child checkboxes change handlers
        childCheckboxes.forEach(child => {
            child.addEventListener('change', updateParentState);
        });
        
        // Initialize state
        updateParentState();
    });
}

/**
 * Adds universal interactive behaviors for Autodesk add-ins
 */
function addUniversalInteractivity() {
    // Make collapsible sections work (data-weave-collapsible)
    const collapsibleHeaders = document.querySelectorAll('[data-weave-collapsible]');
    collapsibleHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const targetSelector = this.dataset.weaveCollapsible;
            const target = targetSelector ? document.querySelector(targetSelector) : this.nextElementSibling;
            
            if (target) {
                const isCollapsed = target.classList.contains('weave-collapsed');
                target.classList.toggle('weave-collapsed');
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('weave-section-toggled', {
                    detail: { section: targetSelector || 'next-sibling', collapsed: !isCollapsed }
                }));
            }
        });
    });
    
    // Enhanced list item selection (data-weave-selectable)
    const selectableLists = document.querySelectorAll('[data-weave-selectable]');
    selectableLists.forEach(list => {
        const items = list.querySelectorAll('.adsk-list-item');
        items.forEach(item => {
            item.addEventListener('click', function() {
                if (list.dataset.weaveSelectable === 'single') {
                    items.forEach(li => li.classList.remove('adsk-list-item--active'));
                }
                this.classList.toggle('adsk-list-item--active');
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('weave-list-item-selected', {
                    detail: { 
                        item: this.textContent.trim(),
                        listId: list.id || 'unnamed-list'
                    }
                }));
            });
        });
    });
    
    // Initialize component systems
    initializeWeaveComponents();
}

/**
 * Initialize Weave UI component systems
 */
function initializeWeaveComponents() {
    // Initialize dropdowns
    initializeDropdowns();
    
    // Initialize accordions
    initializeAccordions();
    
    // Add global event listeners for dropdown repositioning
    window.addEventListener('scroll', repositionOpenDropdowns, true);
    window.addEventListener('resize', repositionOpenDropdowns);
    
    // Spinner animations are handled by CSS
    // This function is available for future JavaScript-based component controls
    console.log('Autodesk Weave UI components initialized');
    
    // Dispatch ready event for add-in developers
    window.dispatchEvent(new CustomEvent('weave-ui-ready', {
        detail: { version: '1.0.0', timestamp: Date.now() }
    }));
}

/**
 * Position dropdown content to escape container overflow
 */
function positionDropdown(button, content) {
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const contentHeight = content.offsetHeight || 200; // Default max height
    
    // Calculate if dropdown should open upward or downward
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const openUpward = spaceBelow < contentHeight && spaceAbove > spaceBelow;
    
    // Set position to fixed and calculate coordinates
    content.style.position = 'fixed';
    content.style.left = buttonRect.left + 'px';
    content.style.width = buttonRect.width + 'px';
    
    if (openUpward) {
        content.style.bottom = (viewportHeight - buttonRect.top + 2) + 'px';
        content.style.top = 'auto';
    } else {
        content.style.top = (buttonRect.bottom + 2) + 'px';
        content.style.bottom = 'auto';
    }
    
    // Store references for repositioning
    content._button = button;
    content._dropdown = button.closest('.adsk-dropdown');
}

/**
 * Reset dropdown content positioning to default
 */
function resetDropdownPosition(content) {
    content.style.position = '';
    content.style.left = '';
    content.style.top = '';
    content.style.bottom = '';
    content.style.width = '';
    content._button = null;
    content._dropdown = null;
}

/**
 * Close dropdown and reset its positioning
 */
function closeDropdown(dropdown) {
    dropdown.classList.remove('adsk-dropdown--open');
    const button = dropdown.querySelector('.adsk-dropdown-button');
    const content = dropdown.querySelector('.adsk-dropdown-content');
    
    if (button) button.setAttribute('aria-expanded', 'false');
    if (content) resetDropdownPosition(content);
}

/**
 * Reposition all open dropdowns (for scroll/resize events)
 */
function repositionOpenDropdowns() {
    const openDropdowns = document.querySelectorAll('.adsk-dropdown--open .adsk-dropdown-content');
    openDropdowns.forEach(content => {
        if (content._button) {
            positionDropdown(content._button, content);
        }
    });
}

/**
 * Initialize dropdown functionality
 */
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.adsk-dropdown');
    
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.adsk-dropdown-button');
        const content = dropdown.querySelector('.adsk-dropdown-content');
        const items = dropdown.querySelectorAll('.adsk-dropdown-item');
        const buttonText = button.querySelector('span');
        
        if (!button || !content) return;
        
        // Toggle dropdown on button click
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    closeDropdown(otherDropdown);
                }
            });
            
            // Toggle current dropdown
            const isOpen = dropdown.classList.contains('adsk-dropdown--open');
            dropdown.classList.toggle('adsk-dropdown--open');
            button.setAttribute('aria-expanded', (!isOpen).toString());
            
            // Position dropdown to escape container overflow when opening
            if (!isOpen) {
                positionDropdown(button, content);
            }
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('weave-dropdown-toggled', {
                detail: { 
                    dropdown: dropdown.id || 'unnamed-dropdown',
                    isOpen: !isOpen
                }
            }));
        });
        
        // Handle item selection
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove selected state from all items
                items.forEach(i => i.classList.remove('adsk-dropdown-item--selected'));
                
                // Add selected state to clicked item
                this.classList.add('adsk-dropdown-item--selected');
                
                // Update button text and add selected class
                if (buttonText) {
                    buttonText.textContent = this.textContent;
                } else {
                    button.textContent = this.textContent;
                }
                
                // Add selected class to button for primary text color
                button.classList.add('adsk-dropdown-button--selected');
                
                // Close dropdown
                closeDropdown(dropdown);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('weave-dropdown-selected', {
                    detail: { 
                        dropdown: dropdown.id || 'unnamed-dropdown',
                        value: this.dataset.value || this.textContent,
                        text: this.textContent,
                        item: this
                    }
                }));
            });
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.adsk-dropdown')) {
            dropdowns.forEach(dropdown => {
                closeDropdown(dropdown);
            });
        }
    });
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                closeDropdown(dropdown);
            });
        }
    });
}

/**
 * Initialize accordion functionality
 */
function initializeAccordions() {
    // Handle both direct header clicks and button-based accordions
    const accordionButtons = document.querySelectorAll('.adsk-accordion-button');
    const accordionHeaders = document.querySelectorAll('.adsk-accordion-header');
    
    // Helper function to sync accordion state (button, content, aria)
    function syncAccordionState(button, target, isOpen) {
        const icon = button.querySelector('.adsk-accordion-icon');
        
        if (isOpen) {
            button.classList.add('adsk-accordion-open');
            button.setAttribute('aria-expanded', 'true');
            target.classList.add('adsk-accordion-open');
            if (icon) icon.style.transform = 'rotate(90deg)'; // Down-pointing
        } else {
            button.classList.remove('adsk-accordion-open');
            button.setAttribute('aria-expanded', 'false');
            target.classList.remove('adsk-accordion-open');
            if (icon) icon.style.transform = 'rotate(0deg)'; // Right-pointing
        }
    }
    
    // Button-based accordions (like in icon system and component demos)
    accordionButtons.forEach(button => {
        const target = document.querySelector(button.dataset.target);
        if (!target) return;
        
        // Initialize state based on data-open attribute or existing state
        const shouldBeOpen = button.hasAttribute('data-open') || 
                           button.classList.contains('adsk-accordion-open') ||
                           button.getAttribute('aria-expanded') === 'true' ||
                           target.classList.contains('adsk-accordion-open');
        
        // Set initial state consistently
        syncAccordionState(button, target, shouldBeOpen);
        
        button.addEventListener('click', function() {
            const isCurrentlyExpanded = this.getAttribute('aria-expanded') === 'true';
            const newState = !isCurrentlyExpanded;
            
            // Update state using helper function
            syncAccordionState(this, target, newState);
            
            // Dispatch custom event for add-in developers
            window.dispatchEvent(new CustomEvent('weave-accordion-toggled', {
                detail: { 
                    accordion: target.id || 'unnamed-accordion',
                    isExpanded: newState,
                    header: this.textContent.trim()
                }
            }));
        });
        
        // Keyboard support for buttons
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Direct header-based accordions (fallback for other patterns)
    accordionHeaders.forEach(header => {
        // Skip headers that contain buttons (already handled above)
        if (header.querySelector('.adsk-accordion-button')) return;
        
        header.addEventListener('click', function() {
            const accordionItem = this.closest('.adsk-accordion-item');
            const content = accordionItem.querySelector('.adsk-accordion-content');
            const isExpanded = accordionItem.classList.contains('adsk-accordion-item--expanded');
            
            if (isExpanded) {
                // Collapse
                accordionItem.classList.remove('adsk-accordion-item--expanded');
                this.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
            } else {
                // Expand
                accordionItem.classList.add('adsk-accordion-item--expanded');
                this.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
            }
            
            // Dispatch custom event for add-in developers
            window.dispatchEvent(new CustomEvent('weave-accordion-toggled', {
                detail: { 
                    accordion: accordionItem.id || 'unnamed-accordion',
                    isExpanded: !isExpanded,
                    header: this.textContent.trim()
                }
            }));
        });
        
        // Keyboard support for headers
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Initialize expanded state for button-based accordions
    const expandedButtons = document.querySelectorAll('.adsk-accordion-button[aria-expanded="true"]');
    expandedButtons.forEach(button => {
        const icon = button.querySelector('.adsk-accordion-icon');
        if (icon) {
            icon.style.transform = 'rotate(90deg)'; // Start down-pointing for expanded
        }
    });
}

/**
 * Message handler for external host app communication
 */
function handleHostAppMessage(event) {
    // Validate origin for security (configure for your host app)
    // if (event.origin !== 'expected-host-origin') return;
    
    try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (message.type === 'weave-ui-theme-change') {
            const { theme, density } = message.payload;
            applyThemeAndDensity(theme, density);
            
            // Dispatch event for add-in developers
            window.dispatchEvent(new CustomEvent('weave-host-theme-changed', {
                detail: { theme, density, source: 'host-app' }
            }));
        }
    } catch (error) {
        console.warn('Failed to parse host app message:', error);
    }
}

/**
 * Public API for Autodesk add-in developers
 */
window.AutodeskWeaveUI = {
    // Theme management
    setTheme: function(themeName) {
        const validThemes = ['light-gray', 'dark-gray', 'dark-blue'];
        if (validThemes.includes(themeName)) {
            applyThemeAndDensity(themeName, null);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('weave-theme-changed', {
                detail: { theme: themeName, source: 'api' }
            }));
        }
    },
    
    // Density management  
    setDensity: function(density) {
        const validDensities = ['high', 'medium'];
        if (validDensities.includes(density)) {
            applyThemeAndDensity(null, density);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('weave-density-changed', {
                detail: { density, source: 'api' }
            }));
        }
    },
    
    // Combined theme and density setting
    setThemeAndDensity: function(theme, density) {
        const validThemes = ['light-gray', 'dark-gray', 'dark-blue'];
        const validDensities = ['high', 'medium'];
        
        if (validThemes.includes(theme) && validDensities.includes(density)) {
            applyThemeAndDensity(theme, density);
            
            // Dispatch combined event
            window.dispatchEvent(new CustomEvent('weave-ui-changed', {
                detail: { theme, density, source: 'api' }
            }));
        }
    },
    
    // Get current theme and density
    getCurrentTheme: function() {
        return localStorage.getItem('weave-ui-theme') || 'light-gray';
    },
    
    getCurrentDensity: function() {
        return localStorage.getItem('weave-ui-density') || 'high';
    },
    
    // Host app integration
    enableHostAppIntegration: function() {
        window.addEventListener('message', handleHostAppMessage);
        console.log('Weave UI: Host app integration enabled');
    },
    
    disableHostAppIntegration: function() {
        window.removeEventListener('message', handleHostAppMessage);
        console.log('Weave UI: Host app integration disabled');
    },
    
    // Simulate host app message (for testing)
    simulateHostAppMessage: function(theme, density) {
        const message = {
            type: 'weave-ui-theme-change',
            payload: { theme, density }
        };
        handleHostAppMessage({ data: message });
    },
    
    // Accordion control utilities for developers
    accordion: {
        /**
         * Open an accordion by button selector or target ID
         * @param {string} selector - CSS selector for button or target ID with #
         */
        open: function(selector) {
            const button = selector.startsWith('#') 
                ? document.querySelector(`[data-target="${selector}"]`)
                : document.querySelector(selector);
            
            if (button && button.getAttribute('aria-expanded') === 'false') {
                button.click();
            }
        },
        
        /**
         * Close an accordion by button selector or target ID  
         * @param {string} selector - CSS selector for button or target ID with #
         */
        close: function(selector) {
            const button = selector.startsWith('#') 
                ? document.querySelector(`[data-target="${selector}"]`)
                : document.querySelector(selector);
            
            if (button && button.getAttribute('aria-expanded') === 'true') {
                button.click();
            }
        },
        
        /**
         * Toggle an accordion by button selector or target ID
         * @param {string} selector - CSS selector for button or target ID with #
         */
        toggle: function(selector) {
            const button = selector.startsWith('#') 
                ? document.querySelector(`[data-target="${selector}"]`)
                : document.querySelector(selector);
            
            if (button) {
                button.click();
            }
        }
    },
    
    // Component utilities for add-in developers
    utils: {
        setupParentChildCheckboxes,
        addUniversalInteractivity,
        initializeWeaveComponents,
        initializeDropdowns
    },
    
    // Version info
    version: '1.0.0'
};
