import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

type NotifyOptions = {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

function toDescription(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

export const notify = {
  success(title: string, descriptionOrOptions?: string | NotifyOptions) {
    if (typeof descriptionOrOptions === "string" || descriptionOrOptions == null) {
      return toast.success(title, {
        description: descriptionOrOptions,
        duration: 4500,
      });
    }
    return toast.success(title, {
      description: descriptionOrOptions.description,
      duration: descriptionOrOptions.duration ?? 4500,
      action: descriptionOrOptions.action,
    });
  },

  error(errorOrTitle: unknown, options?: string | NotifyOptions) {
    const opts = typeof options === "string" ? { description: options } : options ?? {};
    const isErrorLike =
      errorOrTitle instanceof Error ||
      (typeof errorOrTitle === "object" && errorOrTitle !== null);

    if (typeof errorOrTitle === "string" && !opts.description) {
      return toast.error(errorOrTitle, {
        duration: opts.duration ?? 6000,
        action: opts.action,
      });
    }

    if (typeof errorOrTitle === "string") {
      return toast.error(errorOrTitle, {
        description: opts.description,
        duration: opts.duration ?? 6000,
        action: opts.action,
      });
    }

    const message = getApiErrorMessage(
      errorOrTitle,
      typeof opts.description === "string" ? opts.description : "Something went wrong. Please try again."
    );

    // When caller passed a title-like string in options.description as fallback only,
    // show a short title + the friendly message as description when useful.
    const title = isErrorLike ? "Something went wrong" : "Error";
    const description =
      message && message !== title
        ? message
        : toDescription(opts.description);

    return toast.error(title, {
      description: description ?? message,
      duration: opts.duration ?? 6000,
      action: opts.action,
    });
  },

  info(title: string, descriptionOrOptions?: string | NotifyOptions) {
    if (typeof descriptionOrOptions === "string" || descriptionOrOptions == null) {
      return toast.info(title, {
        description: descriptionOrOptions,
        duration: 4500,
      });
    }
    return toast.info(title, {
      description: descriptionOrOptions.description,
      duration: descriptionOrOptions.duration ?? 4500,
      action: descriptionOrOptions.action,
    });
  },

  warning(title: string, descriptionOrOptions?: string | NotifyOptions) {
    if (typeof descriptionOrOptions === "string" || descriptionOrOptions == null) {
      return toast.warning(title, {
        description: descriptionOrOptions,
        duration: 5000,
      });
    }
    return toast.warning(title, {
      description: descriptionOrOptions.description,
      duration: descriptionOrOptions.duration ?? 5000,
      action: descriptionOrOptions.action,
    });
  },

  message(title: string, descriptionOrOptions?: string | NotifyOptions) {
    if (typeof descriptionOrOptions === "string" || descriptionOrOptions == null) {
      return toast.message(title, {
        description: descriptionOrOptions,
        duration: 4500,
      });
    }
    return toast.message(title, {
      description: descriptionOrOptions.description,
      duration: descriptionOrOptions.duration ?? 4500,
      action: descriptionOrOptions.action,
    });
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error?: string | ((error: unknown) => string);
    }
  ): Promise<T> {
    const result = toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) =>
        typeof messages.error === "function"
          ? messages.error(err)
          : messages.error ?? getApiErrorMessage(err),
    });
    return result.unwrap();
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};
