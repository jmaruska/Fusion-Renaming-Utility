# Renamer for Fusion 360

Renamer is a small add-in for Autodesk Fusion 360 that provides a suite of powerful renaming tools for components and bodies. It offers flexible scope selection, allowing you to rename across your entire document, within hierarchies, or just your current multi-selection.

---

## Features
- **Find & Replace**: Quickly search and replace text in component names.
- **Prefix & Suffix**: Add prefixes or suffixes to selected components or bodies.
- **Component Numbering**: Automatically number components with custom padding and increments.
- **Unique Body Names**: Instantly assign unique names to all bodies in your design.
- **Scope Selection**: Apply renaming to the whole document, a hierarchy, or only selected items.
- **Modern UI**: Built with the [ADSK-Weave-UI-CSS-Toolkit](https://github.com/jmaruska/ADSK-Weave-UI-CSS-Toolkit) for a clean, Autodesk HIG-inspired look.

---

## Installation

1. **Download or Clone** this repository to your computer.
2. **Locate your Fusion 360 AddIns folder:**
   - On macOS: `~/Library/Application Support/Autodesk/Autodesk Fusion 360/API/AddIns/`
   - On Windows: `%APPDATA%/Autodesk/Autodesk Fusion 360/API/AddIns/`
3. **Copy the `Renamer` folder** (containing `Renamer.py`, `Renamer.html`, `style.css`, etc.) into your AddIns directory.
4. **Restart Fusion 360** if it is running.
5. In Fusion 360, go to **Tools > Add-Ins**, find `Renamer` in the list, and click **Run**.

---

## Usage

1. Open the **Renamer** palette from the Add-Ins panel.
2. Choose your desired renaming operation:
   - **Find and Replace**: Enter the text to find and its replacement.
   - **Prefix and Suffix**: Add text before or after component names.
   - **Component Numbering**: Set up numbering patterns and apply.
   - **Unique Body Names**: Click to auto-rename all bodies.
3. Select the **scope** for your operation:
   - **All**: Apply to all components/bodies in the document.
   - **Hierarchy**: Apply to the current component and its children.
   - **Selected**: Apply only to your current selection.
4. Click the relevant button to execute the operation.

---

## UI Toolkit
This add-in uses the [ADSK-Weave-UI-CSS-Toolkit](https://github.com/jmaruska/ADSK-Weave-UI-CSS-Toolkit) for a modern, consistent user interface based on Autodesk's HIG dark theme.

---

## Support & Feedback
For issues, suggestions, or contributions, please open an issue or pull request on the GitHub repository.

---

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
