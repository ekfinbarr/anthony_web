/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Small context to share positioning info between Trigger and Viewport.
 * - setTriggerRect: called by a Trigger when pressed, with its DOMRect
 * - rootRef: reference to the NavigationMenu root element (for measuring)
 */
type TriggerRect = DOMRect | null;
type NavMenuContextType = {
  setTriggerRect: (r: TriggerRect) => void;
  rootRef: React.RefObject<HTMLElement | null>;
};
const NavigationMenuContext = React.createContext<NavMenuContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                               Root Navigation                              */
/* -------------------------------------------------------------------------- */

/**
 * NavigationMenu (Root)
 *
 * - Provides a context used to position the viewport under the active trigger
 * - Exposes a ref (`rootRef`) that the viewport uses to compute offsets
 */
const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, forwardedRef) => {
  const rootRef = React.useRef<HTMLElement | null>(null);
  // store the last trigger rect reported by a trigger
  const triggerRectRef = React.useRef<TriggerRect>(null);
  const [, forceRerender] = React.useState(0);

  const setTriggerRect = React.useCallback((r: TriggerRect) => {
    triggerRectRef.current = r;
    if (typeof window !== "undefined") {
      window.__radixLastNavTriggerRect = r ?? undefined;
    }
    // we force a small update so the viewport can read the new rect when it mounts/opens
    forceRerender((n) => n + 1);
  }, []);

  // Combine forwardedRef with internal rootRef so parent can still get the ref
  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [forwardedRef],
  );

  return (
    <NavigationMenuContext.Provider value={{ setTriggerRect, rootRef }}>
      <NavigationMenuPrimitive.Root
        ref={setRefs}
        className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
        {...props}
      >
        {children}
        {/* viewport is still rendered as part of the root for predictable stacking/context */}
        <NavigationMenuViewport />
      </NavigationMenuPrimitive.Root>
    </NavigationMenuContext.Provider>
  );
});
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

/* -------------------------------------------------------------------------- */
/*                          Navigation List + Items                           */
/* -------------------------------------------------------------------------- */

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

/* -------------------------------------------------------------------------- */
/*                                   Trigger                                  */
/* -------------------------------------------------------------------------- */

/**
 * CVA styling for trigger button (unchanged)
 */
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

/**
 * NavigationMenuTrigger
 *
 * - Calls context.setTriggerRect on pointer down with its bounding rect so the
 *   viewport can position itself under the clicked trigger.
 *
 * Why pointerdown?
 * - Using pointerdown ensures we capture the coordinates before focus shifts and before Radix toggles state,
 *   which helps with synchronous layout calculations.
 */
const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, onPointerDown: userOnPointerDown, ...props }, ref) => {
  const ctx = React.useContext(NavigationMenuContext);
  const localRef = React.useRef<HTMLElement | null>(null);

  // merge forwarded ref with localRef
  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") ref(localRef.current);
    else (ref as React.MutableRefObject<HTMLElement | null>).current = localRef.current;
  }, [ref]);

  // pointerdown handler to capture the trigger's DOMRect before Radix toggles
  const onPointerDown: React.PointerEventHandler = (e) => {
    // Preserve any user-provided handler.
    if (userOnPointerDown) userOnPointerDown(e);

    if (!ctx) return;
    const el = localRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    ctx.setTriggerRect(rect);
  };

  return (
    <NavigationMenuPrimitive.Trigger
      ref={localRef}
      onPointerDown={onPointerDown}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDown
        className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
});
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

/* -------------------------------------------------------------------------- */
/*                                  Content                                   */
/* -------------------------------------------------------------------------- */

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

/* -------------------------------------------------------------------------- */
/*                                  Viewport                                  */
/* -------------------------------------------------------------------------- */

/**
 * NavigationMenuViewport (updated)
 *
 * Positioning strategy:
 *  - The wrapper still uses `absolute left-0 top-full` anchored to the root.
 *  - On open, we compute the desired X offset so the Viewport centers under
 *    the trigger rect reported by the trigger.
 *  - We apply an inline transform `translateX(<computed>)` on the Viewport to align it.
 *  - We clamp the X position so the viewport never overflows the root bounds.
 *
 * Notes:
 *  - This avoids depending on ancestor `transform` and makes positioning explicit.
 *  - Measurements are done in useLayoutEffect (before paint) to avoid flicker.
 */
declare global {
  // Small shim used to store the last trigger rect so the viewport can position itself.
  // (Avoids reaching into Radix internal context objects.)
  interface Window {
    __radixLastNavTriggerRect?: DOMRect;
  }
}

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, style, ...props }, forwardedRef) => {
  const ctx = React.useContext(NavigationMenuContext);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  // combined ref so parent can also read it
  React.useEffect(() => {
    if (!forwardedRef) return;
    if (typeof forwardedRef === "function") forwardedRef(viewportRef.current);
    else (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = viewportRef.current;
  }, [forwardedRef]);

  // Inline style to move the viewport horizontally relative to its wrapper
  const [translateX, setTranslateX] = React.useState(0);

  // Observe open/closed state by watching the data-state attr on the viewport root from Radix.
  // We'll check for an "open" state by reading the DOM attribute when the viewport mounts/updates.
  React.useLayoutEffect(() => {
    if (!ctx) return;
    const root = ctx.rootRef.current;
    const viewportEl = viewportRef.current;

    // Instead, read the last known trigger rect from the document using a data-* attribute pattern:
    // We'll store the last trigger rect on the root element itself (set by the Trigger) — adapt Trigger to store there.
    // However, above Trigger implementation used context.setTriggerRect so we need to expose that rect; so let's
    // instead keep a ref on window. (Below we will attempt to read window.__radixLastNavTriggerRect which we set
    // in setTriggerRect — see NavigationMenu root for that global write.)
    const lastTriggerRect = window.__radixLastNavTriggerRect;

    if (!viewportEl) return;

    // get computed state
    const state = viewportEl.getAttribute("data-state") || viewportEl.dataset.state;
    // if not open, reset transform
    if (state !== "open") {
      setTranslateX(0);
      return;
    }

    // Wait a frame to ensure the viewport has its computed width
    requestAnimationFrame(() => {
      try {
        const vpRect = viewportEl.getBoundingClientRect();
        const rootRect = root?.getBoundingClientRect();
        const trigger = lastTriggerRect ?? null;

        if (!rootRect) {
          setTranslateX(0);
          return;
        }

        // Default: center under trigger; if no trigger rect available, center in root
        let desiredCenterX: number;
        if (trigger) {
          desiredCenterX = trigger.left + trigger.width / 2;
        } else {
          desiredCenterX = rootRect.left + rootRect.width / 2;
        }

        // convert to wrapper-local X (wrapper is left aligned to root)
        const desiredLeft = desiredCenterX - vpRect.width / 2;
        // clamp desiredLeft between rootRect.left and rootRect.right - vpRect.width
        const minLeft = rootRect.left;
        const maxLeft = rootRect.right - vpRect.width;
        const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);

        // compute translateX relative to the viewport's current left (viewportEl.style.left may be 0 because wrapper is left-0)
        // We'll compute the difference between clampedLeft and the viewport's current left in viewport coordinate space.
        // viewportEl.getBoundingClientRect().left is its current absolute left.
        const currentLeft = vpRect.left;
        const dx = clampedLeft - currentLeft;

        setTranslateX(dx);
      } catch (err) {
        // if measurement fails, fallback to no transform
        setTranslateX(0);
      }
    });
    // re-run when root or viewport node changes
    // Note: do not include `viewportRef.current` in dependencies (lint rule).
  }, [ctx, className]);

  // Apply the computed translateX as inline transform; keep existing style props intact.
  const mergedStyle = {
    ...(style || {}),
    transform: `translateX(${translateX}px)`,
  };

  // We add a data attribute to the wrapper so it can be found if needed. 
  // The wrapper is required and anchors to the root. Keep markup simple.
  return (
    <div data-radix-navigation-menu-viewport-wrapper className={cn("absolute left-0 top-full flex justify-center w-full")}>
      <NavigationMenuPrimitive.Viewport
        ref={viewportRef}
        className={cn(
          "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        style={mergedStyle}
        {...props}
      />
    </div>
  );
});
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

/* -------------------------------------------------------------------------- */
/*                                 Indicator                                  */
/* -------------------------------------------------------------------------- */

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

/**
 * NOTE about the global helper used in the positioning effect above:
 * - When a trigger reports a rect, we also write it to `window.__radixLastNavTriggerRect`.
 * - This is a small pragmatic shim that avoids lifting a private ref through context internals.
 * - It's safe (plain DOMRect) and avoids complex synchronization issues.
 *
 * If you prefer, we can instead expose triggerRectRef on the context object directly,
 * but that requires some ref re-organization (I can do that on request).
 */
export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};

// ----
// Additional runtime injection to expose last trigger rect from setTriggerRect.
// We do this by wrapping the NavigationMenuContext provider's setter — but since we kept the provider
// implementation inside this module, we will set the global when setTriggerRect is called.
// To accomplish that we must override setTriggerRect above to write to window.__radixLastNavTriggerRect.
// However, TypeScript-only edits to closures are already handled: to ensure this behavior, we will
// set the global when the Trigger calls ctx.setTriggerRect (Trigger uses ctx.setTriggerRect) —
// so modify the setTriggerRect in NavigationMenu root to write to window as well.
//
// If you want me to avoid global writes and instead return a cleaner context (with a visible ref),
// tell me and I'll refactor to store triggerRectRef on the context object directly.
