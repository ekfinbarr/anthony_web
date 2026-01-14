# Date & Time Picker Components - Implementation Guide

## Overview

This document describes the implementation of reusable DatePicker and TimePicker components for the church website application. These components provide a beautiful, accessible, and user-friendly interface for selecting dates and times in forms.

## Components Created

### 1. DatePicker Component
**Location**: `src/components/ui/date-picker.tsx`

A reusable date picker component built on top of `react-day-picker` and styled with shadcn/ui components.

**Features:**
- Calendar popover with month navigation
- Date validation (min/max dates, custom disabled dates)
- Custom date formatting (using date-fns)
- Fully accessible with keyboard navigation
- Theme-aware styling (matches app design system)
- Disabled state support

### 2. TimePicker Component
**Location**: `src/components/ui/time-picker.tsx`

A reusable time picker component with scrollable hour and minute selectors.

**Features:**
- 12-hour (AM/PM) and 24-hour format support
- Scrollable hour and minute selectors
- Customizable minute intervals (e.g., 5-minute steps)
- Confirm/Cancel workflow for better UX
- Theme-aware styling
- Disabled state support

## Usage Examples

### Basic DatePicker Usage

```tsx
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <DatePicker
      date={date}
      onDateChange={setDate}
      placeholder="Select a date"
      minDate={new Date()} // Prevent past dates
    />
  );
}
```

### Advanced DatePicker Usage

```tsx
<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Pick your preferred date"
  disabled={isSubmitting}
  minDate={new Date()} // Minimum selectable date
  maxDate={new Date(2025, 11, 31)} // Maximum selectable date
  disabledDates={(date) => date.getDay() === 0} // Disable Sundays
  dateFormat="PPP" // Custom format (e.g., "January 1, 2024")
  className="w-full"
/>
```

### Basic TimePicker Usage

```tsx
import { TimePicker } from "@/components/ui/time-picker";
import { useState } from "react";

function MyComponent() {
  const [time, setTime] = useState<{ hours: number; minutes: number } | undefined>();

  return (
    <TimePicker
      time={time}
      onTimeChange={setTime}
      format="24h" // or "12h"
      placeholder="Select time"
    />
  );
}
```

### Advanced TimePicker Usage

```tsx
<TimePicker
  time={selectedTime}
  onTimeChange={setSelectedTime}
  format="12h" // 12-hour format with AM/PM
  placeholder="Select time"
  disabled={isSubmitting}
  minuteInterval={5} // 5-minute intervals (00, 05, 10, 15...)
  className="w-full"
/>
```

## Implementation in EventFormPage

The DatePicker and TimePicker components have been integrated into the EventFormPage (`src/pages/admin/EventFormPage.tsx`) for selecting event start and end dates/times.

### Form State Structure

```tsx
const [formData, setFormData] = useState({
  name: "",
  description: "",
  start_date: undefined as Date | undefined,
  start_time: undefined as { hours: number; minutes: number } | undefined,
  end_date: undefined as Date | undefined,
  end_time: undefined as { hours: number; minutes: number } | undefined,
  location: "",
  is_public: true,
  rsvp_enabled: false,
  max_attendees: "",
});
```

### Date/Time Selection Implementation

```tsx
{/* Start Date and Time */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="start_date">
      Start Date <span className="text-destructive">*</span>
    </Label>
    <DatePicker
      date={formData.start_date}
      onDateChange={(date) => handleInputChange("start_date", date)}
      placeholder="Select start date"
      disabled={isSubmitting}
      minDate={new Date()} // Prevent selecting past dates
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="start_time">
      Start Time <span className="text-destructive">*</span>
    </Label>
    <TimePicker
      time={formData.start_time}
      onTimeChange={(time) => handleInputChange("start_time", time)}
      placeholder="Select start time"
      disabled={isSubmitting}
      format="24h"
      minuteInterval={5} // 5-minute intervals for easier selection
    />
  </div>
</div>

{/* End Date and Time */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="end_date">End Date</Label>
    <DatePicker
      date={formData.end_date}
      onDateChange={(date) => handleInputChange("end_date", date)}
      placeholder="Select end date (optional)"
      disabled={isSubmitting}
      minDate={formData.start_date || new Date()} // End date must be after start date
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="end_time">End Time</Label>
    <TimePicker
      time={formData.end_time}
      onTimeChange={(time) => handleInputChange("end_time", time)}
      placeholder="Select end time (optional)"
      disabled={isSubmitting}
      format="24h"
      minuteInterval={5}
    />
  </div>
</div>
```

### Data Conversion for API Submission

The form data (Date objects and time objects) is converted to ISO datetime strings for the API:

```tsx
const handleSubmit = (saveAsDraft: boolean = false) => {
  // Validation...
  
  // Combine date and time objects into Date objects
  const startDateTime = new Date(formData.start_date);
  startDateTime.setHours(formData.start_time.hours, formData.start_time.minutes, 0, 0);

  // Use end date/time if provided, otherwise use start date/time
  const endDateTime = formData.end_date && formData.end_time
    ? (() => {
        const end = new Date(formData.end_date);
        end.setHours(formData.end_time.hours, formData.end_time.minutes, 0, 0);
        return end;
      })()
    : startDateTime;

  const payload = {
    name: formData.name.trim(),
    description: formData.description.trim() || undefined,
    start_date: startDateTime.toISOString(),
    end_date: endDateTime.toISOString(),
    location: formData.location.trim() || undefined,
    is_public: formData.is_public,
  };

  // Submit to API...
};
```

### Loading Event Data

When editing an event, the ISO datetime strings from the API are converted back to Date objects and time objects:

```tsx
useEffect(() => {
  if (isEditMode && event) {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;
    
    setFormData({
      // ... other fields
      start_date: startDate,
      start_time: {
        hours: startDate.getHours(),
        minutes: startDate.getMinutes(),
      },
      end_date: endDate,
      end_time: {
        hours: endDate.getHours(),
        minutes: endDate.getMinutes(),
      },
      // ... other fields
    });
  }
}, [event, isEditMode]);
```

## Component API Reference

### DatePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `Date \| undefined` | `undefined` | The selected date value |
| `onDateChange` | `(date: Date \| undefined) => void` | Required | Callback when date changes |
| `placeholder` | `string` | `"Pick a date"` | Placeholder text |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `className` | `string` | `undefined` | Optional CSS class name |
| `disabledDates` | `(date: Date) => boolean` | `undefined` | Function to disable specific dates |
| `minDate` | `Date` | `undefined` | Minimum selectable date |
| `maxDate` | `Date` | `undefined` | Maximum selectable date |
| `dateFormat` | `string` | `"PPP"` | Date format string (date-fns format) |

### TimePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `time` | `{ hours: number; minutes: number } \| undefined` | `undefined` | Selected time (hours: 0-23, minutes: 0-59) |
| `onTimeChange` | `(time: { hours: number; minutes: number } \| undefined) => void` | Required | Callback when time changes |
| `format` | `"12h" \| "24h"` | `"24h"` | Time format (12-hour with AM/PM or 24-hour) |
| `placeholder` | `string` | `"Select time"` | Placeholder text |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `className` | `string` | `undefined` | Optional CSS class name |
| `minuteInterval` | `number` | `1` | Interval between minutes (e.g., 5 for 00, 05, 10...) |

## Key Features

### DatePicker Features

1. **Calendar Navigation**: Navigate between months/years using arrow buttons
2. **Date Validation**: Prevent selection of invalid dates (past dates, disabled dates, etc.)
3. **Accessibility**: Full keyboard navigation and screen reader support
4. **Theming**: Automatically matches app theme (light/dark mode)
5. **Formatting**: Customizable date display format using date-fns

### TimePicker Features

1. **Dual Format Support**: Switch between 12-hour and 24-hour formats
2. **Scrollable Selectors**: Easy-to-use scrollable lists for hours and minutes
3. **Minute Intervals**: Configure minute selection intervals (1, 5, 10, 15, 30, etc.)
4. **Confirm/Cancel**: Two-step selection process prevents accidental changes
5. **Visual Feedback**: Highlighted selected values for better UX

## Dependencies

The components rely on the following packages (already installed):

- `react-day-picker` - Calendar functionality
- `date-fns` - Date formatting and manipulation
- `@radix-ui/react-popover` - Popover component
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `clsx` / `tailwind-merge` - Class name utilities

## Styling

Both components use the shadcn/ui design system and automatically inherit:
- Theme colors (light/dark mode)
- Border radius
- Spacing
- Typography
- Interactive states (hover, focus, disabled)

## Best Practices

1. **Always validate dates**: Use `minDate` and `maxDate` props to prevent invalid selections
2. **Consistent formatting**: Use consistent date formats across your application
3. **Time format**: Choose 24-hour format for backend storage, 12-hour format for user-friendly display
4. **Minute intervals**: Use 5 or 15-minute intervals for events to simplify scheduling
5. **Disabled states**: Always disable pickers during form submission to prevent changes

## Future Enhancements

Potential improvements for future versions:

1. **Date Range Selection**: Add support for selecting date ranges
2. **Time Zones**: Add timezone support for international events
3. **Presets**: Add common time presets (e.g., "Morning", "Afternoon", "Evening")
4. **Keyboard Shortcuts**: Add keyboard shortcuts for common operations
5. **Touch Optimizations**: Enhanced touch interactions for mobile devices

## Troubleshooting

### Date not displaying correctly
- Ensure dates are valid Date objects, not strings
- Check date format prop if using custom formatting
- Verify timezone handling if dates appear off by hours

### Time picker not updating
- Verify time object structure: `{ hours: number, minutes: number }`
- Hours should be 0-23 for 24h format, 1-12 for 12h format
- Check that `onTimeChange` callback is properly implemented

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that shadcn/ui components are installed
- Verify theme CSS variables are set up correctly

---

**Last Updated**: January 2025  
**Version**: 1.0.0

