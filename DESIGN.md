---
name: BOOKWALKER Random Reader
description: Compact bookshelf controls within the original website's visual style
colors:
  primary: "#80563d"
  primary-hover: "#68432f"
  surface: "#ffffff"
  ink: "#333333"
  muted: "#666666"
  divider: "#e6dfda"
  control-border: "#b9aaa0"
  control-hover: "#f5efeb"
  secondary-hover: "#4e3020"
typography:
  title:
    fontFamily: 'Arial, "Microsoft JhengHei", sans-serif'
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: 'Arial, "Microsoft JhengHei", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Arial, "Microsoft JhengHei", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "3px"
  dialog: "6px"
spacing:
  small: "8px"
  medium: "16px"
  section: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "6px 0"
  button-close:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "8px"
---

# Design System: BOOKWALKER Random Reader

## Overview

Extend the existing BOOKWALKER bookshelf rather than introducing a new brand. Use compact controls, white surfaces, brown actions, and the original site's book metadata language. The user's pinned visual direction is the authority.

## Colors

Primary brown identifies reading and keyboard focus. Neutral text and dividers keep book content prominent. The primary action is darker than the previous userscript's brown to keep white button text readable.

## Typography

Use the same familiar sans-serif stack across text and controls. Book titles are 19px on desktop and 17px on mobile; the dialog heading is 18px. Dates use tabular numerals. Long titles wrap without truncating book names.

## Layout

The dialog fits within the viewport with a maximum width of 600px and 16px outer clearance. Desktop uses a 144px cover beside the book information. At 480px and below the cover narrows to 90px. Metadata stays beside the cover. Primary reading and reroll controls precede a directly visible row of secondary actions.

## Elevation & Depth

The retained native dialog uses one soft shadow (`0 12px 40px #0004`) and a dark backdrop. Controls remain flat. Opening uses a brief clipped reveal; reduced-motion preferences disable it.

## Shapes

Small-radius controls and a modest-radius dialog fit the incumbent website. The toolbar uses a drawn dice SVG, matching the site's monochrome icon treatment.

## Components

- Reading is a normal anchor with a new-tab affordance and an accessible new-tab label.
- Reading and reroll controls have a minimum height of 40px and 8px gaps.
- Secondary actions are directly visible underlined text buttons, with a minimum height of 36px on desktop and 44px at 480px and below.
- Busy controls are disabled; empty and error states give concrete recovery instructions.
- The native dialog owns focus containment and Escape dismissal. Explicit focus rings remain visible.

## Do's and Don'ts

- Do keep the current bookshelf scope visible.
- Do preserve factual titles, authors, dates, and original site-action labels.
- Do keep secondary actions visible without an expansion control.
- Don't add decorative containers or unrelated brand elements.
