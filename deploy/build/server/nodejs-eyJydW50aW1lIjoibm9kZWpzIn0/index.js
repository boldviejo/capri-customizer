import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, LiveReload, useLoaderData, useActionData, useSubmit, Link } from "@remix-run/react";
import { createReadableStreamFromReadable, json, redirect } from "@remix-run/node";
import { isbot } from "isbot";
import { HeroUIProvider, Card, Image, Divider, Input, Select, Button } from "@heroui/react";
import { AppProvider, Card as Card$1, BlockStack, Box, Text, Spinner, InlineGrid, Button as Button$1 } from "@shopify/polaris";
import { useState, useEffect, useRef } from "react";
import path from "path";
import fs from "fs";
import { Storage } from "@google-cloud/storage";
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url
        }
      ),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links$4 = () => [
  { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@heroui/react/dist/index.css" },
  { rel: "stylesheet", href: "/styles/tailwind.css" }
];
function App() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(HeroUIProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {}),
      /* @__PURE__ */ jsx(LiveReload, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App,
  links: links$4
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = {
  ActionMenu: {
    Actions: {
      moreActions: "More actions"
    },
    RollupActions: {
      rollupButton: "View actions"
    }
  },
  ActionList: {
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search",
      placeholder: "Search actions"
    }
  },
  Avatar: {
    label: "Avatar",
    labelWithInitials: "Avatar with initials {initials}"
  },
  Autocomplete: {
    spinnerAccessibilityLabel: "Loading",
    ellipsis: "{content}…"
  },
  Badge: {
    PROGRESS_LABELS: {
      incomplete: "Incomplete",
      partiallyComplete: "Partially complete",
      complete: "Complete"
    },
    TONE_LABELS: {
      info: "Info",
      success: "Success",
      warning: "Warning",
      critical: "Critical",
      attention: "Attention",
      "new": "New",
      readOnly: "Read-only",
      enabled: "Enabled"
    },
    progressAndTone: "{toneLabel} {progressLabel}"
  },
  Banner: {
    dismissButton: "Dismiss notification"
  },
  Button: {
    spinnerAccessibilityLabel: "Loading"
  },
  Common: {
    checkbox: "checkbox",
    undo: "Undo",
    cancel: "Cancel",
    clear: "Clear",
    close: "Close",
    submit: "Submit",
    more: "More"
  },
  ContextualSaveBar: {
    save: "Save",
    discard: "Discard"
  },
  DataTable: {
    sortAccessibilityLabel: "sort {direction} by",
    navAccessibilityLabel: "Scroll table {direction} one column",
    totalsRowHeading: "Totals",
    totalRowHeading: "Total"
  },
  DatePicker: {
    previousMonth: "Show previous month, {previousMonthName} {showPreviousYear}",
    nextMonth: "Show next month, {nextMonth} {nextYear}",
    today: "Today ",
    start: "Start of range",
    end: "End of range",
    months: {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    },
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    daysAbbreviated: {
      monday: "Mo",
      tuesday: "Tu",
      wednesday: "We",
      thursday: "Th",
      friday: "Fr",
      saturday: "Sa",
      sunday: "Su"
    }
  },
  DiscardConfirmationModal: {
    title: "Discard all unsaved changes",
    message: "If you discard changes, you’ll delete any edits you made since you last saved.",
    primaryAction: "Discard changes",
    secondaryAction: "Continue editing"
  },
  DropZone: {
    single: {
      overlayTextFile: "Drop file to upload",
      overlayTextImage: "Drop image to upload",
      overlayTextVideo: "Drop video to upload",
      actionTitleFile: "Add file",
      actionTitleImage: "Add image",
      actionTitleVideo: "Add video",
      actionHintFile: "or drop file to upload",
      actionHintImage: "or drop image to upload",
      actionHintVideo: "or drop video to upload",
      labelFile: "Upload file",
      labelImage: "Upload image",
      labelVideo: "Upload video"
    },
    allowMultiple: {
      overlayTextFile: "Drop files to upload",
      overlayTextImage: "Drop images to upload",
      overlayTextVideo: "Drop videos to upload",
      actionTitleFile: "Add files",
      actionTitleImage: "Add images",
      actionTitleVideo: "Add videos",
      actionHintFile: "or drop files to upload",
      actionHintImage: "or drop images to upload",
      actionHintVideo: "or drop videos to upload",
      labelFile: "Upload files",
      labelImage: "Upload images",
      labelVideo: "Upload videos"
    },
    errorOverlayTextFile: "File type is not valid",
    errorOverlayTextImage: "Image type is not valid",
    errorOverlayTextVideo: "Video type is not valid"
  },
  EmptySearchResult: {
    altText: "Empty search results"
  },
  Frame: {
    skipToContent: "Skip to content",
    navigationLabel: "Navigation",
    Navigation: {
      closeMobileNavigationLabel: "Close navigation"
    }
  },
  FullscreenBar: {
    back: "Back",
    accessibilityLabel: "Exit fullscreen mode"
  },
  Filters: {
    moreFilters: "More filters",
    moreFiltersWithCount: "More filters ({count})",
    filter: "Filter {resourceName}",
    noFiltersApplied: "No filters applied",
    cancel: "Cancel",
    done: "Done",
    clearAllFilters: "Clear all filters",
    clear: "Clear",
    clearLabel: "Clear {filterName}",
    addFilter: "Add filter",
    clearFilters: "Clear all",
    searchInView: "in:{viewName}"
  },
  FilterPill: {
    clear: "Clear",
    unsavedChanges: "Unsaved changes - {label}"
  },
  IndexFilters: {
    searchFilterTooltip: "Search and filter",
    searchFilterTooltipWithShortcut: "Search and filter (F)",
    searchFilterAccessibilityLabel: "Search and filter results",
    sort: "Sort your results",
    addView: "Add a new view",
    newView: "Custom search",
    SortButton: {
      ariaLabel: "Sort the results",
      tooltip: "Sort",
      title: "Sort by",
      sorting: {
        asc: "Ascending",
        desc: "Descending",
        az: "A-Z",
        za: "Z-A"
      }
    },
    EditColumnsButton: {
      tooltip: "Edit columns",
      accessibilityLabel: "Customize table column order and visibility"
    },
    UpdateButtons: {
      cancel: "Cancel",
      update: "Update",
      save: "Save",
      saveAs: "Save as",
      modal: {
        title: "Save view as",
        label: "Name",
        sameName: "A view with this name already exists. Please choose a different name.",
        save: "Save",
        cancel: "Cancel"
      }
    }
  },
  IndexProvider: {
    defaultItemSingular: "Item",
    defaultItemPlural: "Items",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} are selected",
    selected: "{selectedItemsCount} selected",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}"
  },
  IndexTable: {
    emptySearchTitle: "No {resourceNamePlural} found",
    emptySearchDescription: "Try changing the filters or search term",
    onboardingBadgeText: "New",
    resourceLoadingAccessibilityLabel: "Loading {resourceNamePlural}…",
    selectAllLabel: "Select all {resourceNamePlural}",
    selected: "{selectedItemsCount} selected",
    undo: "Undo",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural}",
    selectItem: "Select {resourceName}",
    selectButtonText: "Select",
    sortAccessibilityLabel: "sort {direction} by"
  },
  Loading: {
    label: "Page loading bar"
  },
  Modal: {
    iFrameTitle: "body markup",
    modalWarning: "These required properties are missing from Modal: {missingProps}"
  },
  Page: {
    Header: {
      rollupActionsLabel: "View actions for {title}",
      pageReadyAccessibilityLabel: "{title}. This page is ready"
    }
  },
  Pagination: {
    previous: "Previous",
    next: "Next",
    pagination: "Pagination"
  },
  ProgressBar: {
    negativeWarningMessage: "Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.",
    exceedWarningMessage: "Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."
  },
  ResourceList: {
    sortingLabel: "Sort by",
    defaultItemSingular: "item",
    defaultItemPlural: "items",
    showing: "Showing {itemsCount} {resource}",
    showingTotalCount: "Showing {itemsCount} of {totalItemsCount} {resource}",
    loading: "Loading {resource}",
    selected: "{selectedItemsCount} selected",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} in your store are selected",
    allFilteredItemsSelected: "All {itemsLength}+ {resourceNamePlural} in this filter are selected",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural} in your store",
    selectAllFilteredItems: "Select all {itemsLength}+ {resourceNamePlural} in this filter",
    emptySearchResultTitle: "No {resourceNamePlural} found",
    emptySearchResultDescription: "Try changing the filters or search term",
    selectButtonText: "Select",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}",
    Item: {
      actionsDropdownLabel: "Actions for {accessibilityLabel}",
      actionsDropdown: "Actions dropdown",
      viewItem: "View details for {itemName}"
    },
    BulkActions: {
      actionsActivatorLabel: "Actions",
      moreActionsActivatorLabel: "More actions"
    }
  },
  SkeletonPage: {
    loadingLabel: "Page loading"
  },
  Tabs: {
    newViewAccessibilityLabel: "Create new view",
    newViewTooltip: "Create view",
    toggleTabsLabel: "More views",
    Tab: {
      rename: "Rename view",
      duplicate: "Duplicate view",
      edit: "Edit view",
      editColumns: "Edit columns",
      "delete": "Delete view",
      copy: "Copy of {name}",
      deleteModal: {
        title: "Delete view?",
        description: "This can’t be undone. {viewName} view will no longer be available in your admin.",
        cancel: "Cancel",
        "delete": "Delete view"
      }
    },
    RenameModal: {
      title: "Rename view",
      label: "Name",
      cancel: "Cancel",
      create: "Save",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    DuplicateModal: {
      title: "Duplicate view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    CreateViewModal: {
      title: "Create new view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    }
  },
  Tag: {
    ariaLabel: "Remove {children}"
  },
  TextField: {
    characterCount: "{count} characters",
    characterCountWithMaxLength: "{count} of {limit} characters used"
  },
  TooltipOverlay: {
    accessibilityLabel: "Tooltip: {label}"
  },
  TopBar: {
    toggleMenuLabel: "Toggle menu",
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search"
    }
  },
  MediaCard: {
    dismissButton: "Dismiss",
    popoverButton: "Actions"
  },
  VideoThumbnail: {
    playButtonA11yLabel: {
      "default": "Play video",
      defaultWithDuration: "Play video of length {duration}",
      duration: {
        hours: {
          other: {
            only: "{hourCount} hours",
            andMinutes: "{hourCount} hours and {minuteCount} minutes",
            andMinute: "{hourCount} hours and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hours, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hours, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hours, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hours and {secondCount} seconds",
            andSecond: "{hourCount} hours and {secondCount} second"
          },
          one: {
            only: "{hourCount} hour",
            andMinutes: "{hourCount} hour and {minuteCount} minutes",
            andMinute: "{hourCount} hour and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hour, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hour, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hour, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hour and {secondCount} seconds",
            andSecond: "{hourCount} hour and {secondCount} second"
          }
        },
        minutes: {
          other: {
            only: "{minuteCount} minutes",
            andSeconds: "{minuteCount} minutes and {secondCount} seconds",
            andSecond: "{minuteCount} minutes and {secondCount} second"
          },
          one: {
            only: "{minuteCount} minute",
            andSeconds: "{minuteCount} minute and {secondCount} seconds",
            andSecond: "{minuteCount} minute and {secondCount} second"
          }
        },
        seconds: {
          other: "{secondCount} seconds",
          one: "{secondCount} second"
        }
      }
    }
  }
};
const enTranslations = {
  Polaris
};
const links$3 = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@12.0.0/build/esm/styles.css" }
];
const loader$4 = async () => {
  return json({
    polarisTranslations: {
      locale: "en"
    }
  });
};
function UnauthenticatedLayout() {
  useLoaderData();
  return /* @__PURE__ */ jsx(AppProvider, { i18n: enTranslations, children: /* @__PURE__ */ jsx("div", { style: { padding: "1rem" }, children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UnauthenticatedLayout,
  links: links$3,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const getStorefrontApiToken = () => {
  return process.env.SHOPIFY_STOREFRONT_API_TOKEN;
};
const getShopifyDomain = () => {
  return process.env.SHOPIFY_DOMAIN || "capri-dev-store.myshopify.com";
};
const getStorefrontHeaders = () => {
  return {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": getStorefrontApiToken() || ""
  };
};
const getStorefrontApiUrl = () => {
  return `https://${getShopifyDomain()}/api/2024-01/graphql.json`;
};
const queryStorefrontApi = async (query, variables = {}) => {
  const response = await fetch(getStorefrontApiUrl(), {
    method: "POST",
    headers: getStorefrontHeaders(),
    body: JSON.stringify({
      query,
      variables
    })
  });
  return response.json();
};
function ModernCustomizer({ product, onSubmit }) {
  var _a;
  const [customText, setCustomText] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  const [textPosition, setTextPosition] = useState("center");
  const [imagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    if (product && product.variants.length > 0) {
      const availableVariant = product.variants.find((v) => v.availableForSale);
      setSelectedVariantId((availableVariant == null ? void 0 : availableVariant.id) || product.variants[0].id);
    }
    if (product && product.images.length > 0) {
      setImagePreview(product.images[0].url);
    }
  }, [product]);
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("text", customText);
    formData.append("fontFamily", fontFamily);
    formData.append("fontSize", fontSize.toString());
    formData.append("color", textColor);
    formData.append("variantId", selectedVariantId);
    formData.append("position", textPosition);
    if (imagePreview && !product.images.some((img) => img.url === imagePreview)) {
      formData.append("uploadedImage", imagePreview);
    }
    onSubmit(formData);
  };
  const fontOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" }
  ];
  const positionOptions = [
    { value: "top", label: "Top" },
    { value: "center", label: "Center" },
    { value: "bottom", label: "Bottom" }
  ];
  const getTextPositionStyle = () => {
    const baseStyle = {
      position: "absolute",
      width: "80%",
      textAlign: "center",
      fontFamily,
      fontSize: `${fontSize}px`,
      color: textColor,
      padding: "10px"
    };
    const positionStyles = {
      top: { ...baseStyle, top: "10%", left: "10%" },
      center: { ...baseStyle, top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      bottom: { ...baseStyle, bottom: "10%", left: "10%" }
    };
    return positionStyles[textPosition];
  };
  return /* @__PURE__ */ jsx(Card, { className: "w-full mx-auto max-w-6xl", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 p-4", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "relative h-96 bg-gray-100 rounded-md", children: [
      imagePreview && /* @__PURE__ */ jsx(
        Image,
        {
          src: imagePreview,
          alt: product.title,
          className: "object-contain h-full w-full"
        }
      ),
      customText && /* @__PURE__ */ jsx(
        "div",
        {
          style: getTextPositionStyle(),
          className: "whitespace-pre-wrap",
          children: customText
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: product.title }),
      /* @__PURE__ */ jsxs("div", { className: "bg-green-100 text-green-800 px-2 py-1 rounded text-sm inline-block w-fit", children: [
        "$",
        ((_a = product.variants.find((v) => v.id === selectedVariantId)) == null ? void 0 : _a.price) || "N/A"
      ] }),
      /* @__PURE__ */ jsx(Divider, { className: "my-2" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "Your Custom Text" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: customText,
              onChange: (e) => setCustomText(e.target.value),
              placeholder: "Enter your text here"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "Text Position" }),
          /* @__PURE__ */ jsx(
            Select,
            {
              value: textPosition,
              onChange: (e) => setTextPosition(e.target.value),
              children: positionOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "Font Family" }),
          /* @__PURE__ */ jsx(
            Select,
            {
              value: fontFamily,
              onChange: (e) => setFontFamily(e.target.value),
              children: fontOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium", children: [
            "Font Size: ",
            fontSize,
            "px"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: fontSize,
              onChange: (e) => setFontSize(parseInt(e.target.value)),
              min: 8,
              max: 36,
              step: 1,
              className: "w-full"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "Text Color" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "color",
              value: textColor,
              onChange: (e) => setTextColor(e.target.value),
              className: "w-full h-10"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", children: "Product Variant" }),
          /* @__PURE__ */ jsx(
            Select,
            {
              value: selectedVariantId,
              onChange: (e) => setSelectedVariantId(e.target.value),
              children: product.variants.map((variant) => /* @__PURE__ */ jsxs(
                "option",
                {
                  value: variant.id,
                  disabled: !variant.availableForSale,
                  children: [
                    variant.title,
                    " - $",
                    variant.price,
                    " ",
                    !variant.availableForSale && "(Out of Stock)"
                  ]
                },
                variant.id
              ))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Divider, { className: "my-2" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          color: "primary",
          className: "w-full py-3 mt-4",
          children: "Add to Cart"
        }
      )
    ] }) })
  ] }) });
}
const links$2 = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@12.0.0/build/esm/styles.css" }
];
const loader$3 = async ({ params }) => {
  const { handle } = params;
  if (!handle) {
    return json({
      error: "Product handle is required"
    }, { status: 400 });
  }
  const shopifyDomain = getShopifyDomain();
  if (!process.env.SHOPIFY_STOREFRONT_API_TOKEN) {
    console.warn("SHOPIFY_STOREFRONT_API_TOKEN is not set, returning mock data");
    if (handle === "sample-product-1" || handle === "sample-product-2") {
      const productNumber = handle === "sample-product-1" ? "1" : "2";
      return json({
        product: {
          id: `gid://shopify/Product/${productNumber}`,
          title: `Sample Product ${productNumber}`,
          handle,
          description: `<p>This is a detailed description for Sample Product ${productNumber}. This appears when the Storefront API token is not configured.</p>`,
          variants: [
            {
              id: `gid://shopify/ProductVariant/${productNumber}1`,
              title: "Default",
              price: "19.99",
              availableForSale: true
            }
          ],
          images: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: `Sample product ${productNumber} image`
            }
          ]
        },
        error: null,
        shopifyDomain
      });
    } else {
      return json({
        error: "Product not found"
      }, { status: 404 });
    }
  }
  try {
    const query = `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          descriptionHtml
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    `;
    const variables = { handle };
    const responseData = await queryStorefrontApi(query, variables);
    const productData = responseData.data.productByHandle;
    if (!productData) {
      return json({
        error: "Product not found"
      }, { status: 404 });
    }
    const product = {
      id: productData.id,
      title: productData.title,
      handle: productData.handle,
      description: productData.descriptionHtml,
      variants: productData.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        price: node.price.amount,
        availableForSale: node.availableForSale
      })),
      images: productData.images.edges.map(({ node }) => ({
        url: node.url,
        altText: node.altText || productData.title
      }))
    };
    return json({
      product,
      error: null,
      shopifyDomain
    });
  } catch (error) {
    console.error("Error loading product:", error);
    return json({
      error: "Failed to load product"
    }, { status: 500 });
  }
};
const action$4 = async ({ request }) => {
  const formData = await request.formData();
  const text = String(formData.get("text") || "");
  const fontFamily = String(formData.get("fontFamily") || "");
  const fontSize = String(formData.get("fontSize") || "16");
  const color = String(formData.get("color") || "");
  const variantId = String(formData.get("variantId") || "");
  const position = String(formData.get("position") || "center");
  const uploadedImage = formData.get("uploadedImage") ? String(formData.get("uploadedImage")) : null;
  if (!text || !fontFamily || !fontSize || !color || !variantId) {
    return json({
      error: "Missing required fields",
      success: false
    });
  }
  const shopifyDomain = getShopifyDomain();
  if (!process.env.SHOPIFY_STOREFRONT_API_TOKEN) {
    console.warn("SHOPIFY_STOREFRONT_API_TOKEN is not set, returning mock checkout URL");
    return json({
      success: true,
      checkoutUrl: `https://${shopifyDomain}/cart/${variantId}:1?attributes[Custom%20Text]=${encodeURIComponent(text)}&attributes[Font]=${encodeURIComponent(fontFamily)}&attributes[Font%20Size]=${encodeURIComponent(fontSize)}&attributes[Text%20Color]=${encodeURIComponent(color)}&attributes[Position]=${encodeURIComponent(position)}`,
      message: "Added to cart (test mode)"
    });
  }
  try {
    const cartCreateQuery = `
      mutation cartCreate {
        cartCreate {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const cartCreateResult = await queryStorefrontApi(cartCreateQuery);
    const cartData = cartCreateResult.data.cartCreate;
    if (cartData.userErrors && cartData.userErrors.length > 0) {
      console.error("Error creating cart:", cartData.userErrors);
      return json({
        error: "Error creating cart: " + cartData.userErrors[0].message,
        success: false
      });
    }
    const cartId = cartData.cart.id;
    const customAttributes = [
      { key: "Custom Text", value: text },
      { key: "Font", value: fontFamily },
      { key: "Font Size", value: fontSize },
      { key: "Text Color", value: color },
      { key: "Position", value: position }
    ];
    if (uploadedImage) {
      customAttributes.push({ key: "Uploaded Image", value: uploadedImage });
    }
    const attributesString = customAttributes.map((attr) => `{key: "${attr.key}", value: "${attr.value}"}`).join(",");
    const cartAddQuery = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const cartAddVariables = {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity: 1,
          attributes: customAttributes
        }
      ]
    };
    const cartAddResult = await queryStorefrontApi(cartAddQuery, cartAddVariables);
    const cartAddData = cartAddResult.data.cartLinesAdd;
    if (cartAddData.userErrors && cartAddData.userErrors.length > 0) {
      console.error("Error adding item to cart:", cartAddData.userErrors);
      return json({
        error: "Error adding item to cart: " + cartAddData.userErrors[0].message,
        success: false
      });
    }
    return json({
      success: true,
      checkoutUrl: cartAddData.cart.checkoutUrl,
      message: "Item added to cart successfully"
    });
  } catch (error) {
    console.error("Error in checkout process:", error);
    return json({
      error: "An error occurred during checkout",
      success: false
    });
  }
};
function ProductCustomizer$1() {
  const data = useLoaderData();
  const { product, error, shopifyDomain } = data;
  const actionData = useActionData();
  const submit = useSubmit();
  const [pendingBridgeRequest, setPendingBridgeRequest] = useState(null);
  const handleActionResponse = (response) => {
    if (response == null ? void 0 : response.checkoutUrl) {
      window.location.href = response.checkoutUrl;
    } else if (response == null ? void 0 : response.error) {
      alert(response.error);
    }
  };
  useEffect(() => {
    if (actionData) {
      handleActionResponse(actionData);
    }
  }, [actionData]);
  const handleSubmit = async (formData) => {
    submit(formData, { method: "post" });
  };
  if (error) {
    return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "critical", children: error }) }) }) });
  }
  if (!product) {
    return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "Loading product..." }) }) }) });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(ModernCustomizer, { product, onSubmit: handleSubmit }) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: ProductCustomizer$1,
  links: links$2,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const links$1 = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@12.0.0/build/esm/styles.css" }
];
const loader$2 = async () => {
  try {
    const query = `
      query {
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    `;
    const responseData = await queryStorefrontApi(query);
    if (!responseData.data || !responseData.data.products) {
      console.error("Invalid response from Storefront API:", responseData);
      throw new Error("Invalid response from Shopify Storefront API");
    }
    const productsData = responseData.data.products.edges;
    const products = productsData.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      featuredImage: node.featuredImage ? {
        url: node.featuredImage.url,
        altText: node.featuredImage.altText || node.title
      } : null
    }));
    return json({
      products,
      error: null
    });
  } catch (error) {
    console.error("Error loading products:", error);
    return json({
      products: [],
      error: "Failed to load products"
    }, { status: 500 });
  }
};
function CustomizeProductsIndex() {
  const data = useLoaderData();
  const { products, error } = data;
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "center", padding: "100px" }, children: /* @__PURE__ */ jsx(Spinner, { size: "large" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "critical", children: error }) }) }) });
  }
  if (products.length === 0) {
    return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "No products available for customization." }) }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "page-container", style: { maxWidth: "1200px", margin: "0 auto", padding: "20px" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "800", children: [
    /* @__PURE__ */ jsxs(Box, { padding: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h1", variant: "headingXl", children: "Customize a Product" }),
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyLg", children: "Select a product below to add your custom personalization." })
    ] }),
    /* @__PURE__ */ jsx(InlineGrid, { columns: { xs: 1, sm: 2, md: 3 }, gap: "400", children: products.map((product) => /* @__PURE__ */ jsx(ProductCard, { product }, product.id)) })
  ] }) });
}
function ProductCard({ product }) {
  return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
    /* @__PURE__ */ jsx("div", { style: { position: "relative", paddingBottom: "75%", overflow: "hidden" }, children: product.featuredImage ? /* @__PURE__ */ jsx(
      "img",
      {
        src: product.featuredImage.url,
        alt: product.featuredImage.altText,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px"
        }
      }
    ) : /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f4f6f8",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px"
    }, children: /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", children: "No image available" }) }) }),
    /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: product.title }),
      product.description && /* @__PURE__ */ jsx(Text, { as: "p", truncate: true, children: product.description }),
      /* @__PURE__ */ jsx(Box, { paddingBlockStart: "300", children: /* @__PURE__ */ jsx(Link, { to: `/unauthenticated/customize/${product.handle}`, style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(Button$1, { fullWidth: true, children: "Customize This Product" }) }) })
    ] }) })
  ] }) });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CustomizeProductsIndex,
  links: links$1,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@11.0.0/build/esm/styles.css" }
];
const loader$1 = async ({ request, params }) => {
  try {
    const { handle } = params;
    if (!handle) {
      return json({
        error: "Product handle is required"
      }, { status: 400 });
    }
    if (handle === "sample-product-1" || handle === "sample-product-2") {
      const productNumber = handle === "sample-product-1" ? "1" : "2";
      return json({
        product: {
          id: `gid://shopify/Product/${productNumber}`,
          title: `Sample Product ${productNumber}`,
          handle,
          description: `<p>This is a detailed description for Sample Product ${productNumber}. This appears when the Storefront API token is not configured.</p>`,
          variants: [
            {
              id: `gid://shopify/ProductVariant/${productNumber}1`,
              title: "Default",
              price: "19.99",
              availableForSale: true
            }
          ],
          images: [
            {
              url: "https://via.placeholder.com/800x600",
              altText: `Sample product ${productNumber} image`
            }
          ]
        },
        error: null
      });
    }
    const query = `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          descriptionHtml
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    `;
    const variables = { handle };
    const responseData = await queryStorefrontApi(query, variables);
    const productData = responseData.data.productByHandle;
    if (!productData) {
      return json({
        error: "Product not found"
      }, { status: 404 });
    }
    const product = {
      id: productData.id,
      title: productData.title,
      handle: productData.handle,
      description: productData.descriptionHtml,
      variants: productData.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        price: node.price.amount,
        availableForSale: node.availableForSale
      })),
      images: productData.images.edges.map(({ node }) => ({
        url: node.url,
        altText: node.altText || productData.title
      }))
    };
    return json({
      product,
      error: null
    });
  } catch (error) {
    console.error("Error loading product:", error);
    return json({
      error: "Failed to load product"
    }, { status: 500 });
  }
};
const action$3 = async ({ request }) => {
  try {
    const formData = await request.formData();
    const text = String(formData.get("text") || "");
    const fontFamily = String(formData.get("fontFamily") || "");
    const fontSize = String(formData.get("fontSize") || "16");
    const color = String(formData.get("color") || "");
    const variantId = String(formData.get("variantId") || "");
    const position = String(formData.get("position") || "center");
    const uploadedImage = formData.get("uploadedImage") ? String(formData.get("uploadedImage")) : null;
    if (!text || !fontFamily || !fontSize || !color || !variantId) {
      return json({
        success: false,
        message: "Missing required fields"
      });
    }
    const shopifyDomain = getShopifyDomain();
    return json({
      success: true,
      checkoutUrl: `https://${shopifyDomain}/cart/${variantId}:1?attributes[Custom%20Text]=${encodeURIComponent(text)}&attributes[Font]=${encodeURIComponent(fontFamily)}&attributes[Font%20Size]=${encodeURIComponent(fontSize)}&attributes[Text%20Color]=${encodeURIComponent(color)}&attributes[Position]=${encodeURIComponent(position)}`,
      message: "Added to cart (test mode)"
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return json({
      success: false,
      message: "An error occurred while adding your customization to cart"
    });
  }
};
function ProductCustomizer() {
  const data = useLoaderData();
  const { product, error } = data;
  const submit = useSubmit();
  const handleSubmit = (formData) => {
    submit(formData, { method: "post" });
  };
  if (error) {
    return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "critical", children: error }) }) }) });
  }
  if (!product) {
    return /* @__PURE__ */ jsx(Card$1, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "Loading product..." }) }) }) });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(ModernCustomizer, { product, onSubmit: handleSubmit }) });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: ProductCustomizer,
  links,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function action$2({ request }) {
  try {
    if (request.method !== "PUT") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
    const url = new URL(request.url);
    const fileName = url.searchParams.get("fileName");
    const contentType = url.searchParams.get("contentType");
    if (!fileName || !contentType) {
      return json({ error: "Missing fileName or contentType" }, { status: 400 });
    }
    console.log(`[MOCK] Received file: ${fileName}, type: ${contentType}`);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    return json({
      success: true,
      fileUrl: `/uploads/${fileName}`
    });
  } catch (error) {
    console.error("Error handling mock upload:", error);
    return json({
      error: "Failed to handle mock upload"
    }, { status: 500 });
  }
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
async function getSignedUploadUrl$1(fileName, contentType) {
  console.log(`[MOCK] Generating signed URL for file: ${fileName}, type: ${contentType}`);
  const mockUploadUrl = `/api/mock-upload?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`;
  const mockFileUrl = `/uploads/${fileName}`;
  return {
    uploadUrl: mockUploadUrl,
    fileUrl: mockFileUrl
  };
}
const isDevelopment = process.env.NODE_ENV === "development";
const useMockStorage = process.env.USE_MOCK_STORAGE === "true";
let storage;
try {
  if (isDevelopment || useMockStorage) {
    console.log("[STORAGE] Using mock implementation");
    storage = null;
  } else {
    storage = new Storage();
  }
} catch (error) {
  console.error("Failed to initialize Google Cloud Storage:", error);
  storage = null;
}
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "capri-customizer-images";
async function getSignedUploadUrl(fileName, contentType) {
  if (isDevelopment || useMockStorage || !storage) {
    return getSignedUploadUrl$1(fileName, contentType);
  }
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1e3,
      // 15 minutes
      contentType
    });
    return {
      uploadUrl: url,
      fileUrl: `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`
    };
  } catch (error) {
    console.error("Failed to get signed URL:", error);
    throw new Error("Failed to initialize image upload");
  }
}
async function action$1({ request }) {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
    const body = await request.json();
    const { fileName, contentType } = body;
    if (!fileName || !contentType) {
      return json({ error: "Missing fileName or contentType" }, { status: 400 });
    }
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const uniqueFileName = `${timestamp}-${randomString}-${fileName}`;
    const { uploadUrl, fileUrl } = await getSignedUploadUrl(uniqueFileName, contentType);
    return json({
      success: true,
      uploadUrl,
      fileUrl
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return json({
      error: "Failed to generate upload URL"
    }, { status: 500 });
  }
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
function CloudImageUploader({
  onUploadComplete,
  onUploadError,
  className = ""
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const handleFileChange = async (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (!file)
      return;
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const response = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get upload URL");
      }
      const { uploadUrl, fileUrl } = await response.json();
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadComplete(fileUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  const triggerFileInput = () => {
    var _a;
    (_a = fileInputRef.current) == null ? void 0 : _a.click();
  };
  return /* @__PURE__ */ jsxs("div", { className: `cloud-image-uploader ${className}`, children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        ref: fileInputRef,
        onChange: handleFileChange,
        accept: "image/*",
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: triggerFileInput,
        disabled: isUploading,
        className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300",
        children: isUploading ? `Uploading... ${uploadProgress}%` : "Upload Image"
      }
    ),
    isUploading && /* @__PURE__ */ jsx("div", { className: "w-full mt-2 bg-gray-200 rounded-full h-2.5", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "bg-blue-600 h-2.5 rounded-full",
        style: { width: `${uploadProgress}%` }
      }
    ) })
  ] });
}
async function action() {
  return json({ success: true });
}
function ExampleForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const actionData = useActionData();
  const handleUploadComplete = (url) => {
    setImageUrl(url);
    setUploadError(null);
  };
  const handleUploadError = (error) => {
    setUploadError(error.message);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto p-6 bg-white rounded-lg shadow-md", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-6", children: "Product Form" }),
    /* @__PURE__ */ jsxs("form", { method: "post", className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Product Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Product Image" }),
        /* @__PURE__ */ jsx(
          CloudImageUploader,
          {
            onUploadComplete: handleUploadComplete,
            onUploadError: handleUploadError,
            className: "mb-2"
          }
        ),
        uploadError && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: uploadError }),
        imageUrl && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-2", children: "Preview:" }),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: imageUrl,
              alt: "Preview",
              className: "max-w-full h-auto max-h-48 rounded"
            }
          ),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "imageUrl", value: imageUrl })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            name: "description",
            rows: 3,
            className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          children: "Submit"
        }
      ),
      (actionData == null ? void 0 : actionData.success) && /* @__PURE__ */ jsx("p", { className: "text-green-500", children: "Form submitted successfully!" })
    ] })
  ] });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: ExampleForm
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({ request }) => {
  return redirect("/unauthenticated/customize");
};
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DQSgoso0.js", "imports": ["/assets/components-DFXdd6rU.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-Bv8OMJQw.js", "imports": ["/assets/components-DFXdd6rU.js", "/assets/filter-props-Cb1FLIbl.js", "/assets/global-config-BfVCAYU5.js"], "css": [] }, "routes/unauthenticated.customize.$handle": { "id": "routes/unauthenticated.customize.$handle", "parentId": "routes/unauthenticated", "path": "customize/:handle", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/unauthenticated.customize._handle-SJojVZMk.js", "imports": ["/assets/components-DFXdd6rU.js", "/assets/ModernCustomizer-BU1uyS7p.js", "/assets/BlockStack-ES5-XE_d.js", "/assets/filter-props-Cb1FLIbl.js", "/assets/breakpoints-CbqBGKfb.js"], "css": [] }, "routes/unauthenticated.customize._index": { "id": "routes/unauthenticated.customize._index", "parentId": "routes/unauthenticated", "path": "customize", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/unauthenticated.customize._index-DoVL3Uyt.js", "imports": ["/assets/components-DFXdd6rU.js", "/assets/BlockStack-ES5-XE_d.js", "/assets/use-is-after-initial-mount-vw2a61a1.js", "/assets/breakpoints-CbqBGKfb.js"], "css": [] }, "routes/customize.$handle": { "id": "routes/customize.$handle", "parentId": "root", "path": "customize/:handle", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/customize._handle-DLCHPGn_.js", "imports": ["/assets/components-DFXdd6rU.js", "/assets/ModernCustomizer-BU1uyS7p.js", "/assets/BlockStack-ES5-XE_d.js", "/assets/filter-props-Cb1FLIbl.js", "/assets/breakpoints-CbqBGKfb.js"], "css": [] }, "routes/api.mock-upload": { "id": "routes/api.mock-upload", "parentId": "root", "path": "api/mock-upload", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.mock-upload-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/unauthenticated": { "id": "routes/unauthenticated", "parentId": "root", "path": "unauthenticated", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/unauthenticated-DMLHT8M_.js", "imports": ["/assets/components-DFXdd6rU.js", "/assets/breakpoints-CbqBGKfb.js", "/assets/use-is-after-initial-mount-vw2a61a1.js"], "css": [] }, "routes/api.upload-url": { "id": "routes/api.upload-url", "parentId": "root", "path": "api/upload-url", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.upload-url-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/example-form": { "id": "routes/example-form", "parentId": "root", "path": "example-form", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/example-form-D2r5J89e.js", "imports": ["/assets/components-DFXdd6rU.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-l0sNRNKZ.js", "imports": [], "css": [] } }, "url": "/assets/manifest-c71135b8.js", "version": "c71135b8" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/unauthenticated": {
    id: "routes/unauthenticated",
    parentId: "root",
    path: "unauthenticated",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/unauthenticated.customize.$handle": {
    id: "routes/unauthenticated.customize.$handle",
    parentId: "routes/unauthenticated",
    path: "customize/:handle",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/unauthenticated.customize._index": {
    id: "routes/unauthenticated.customize._index",
    parentId: "routes/unauthenticated",
    path: "customize",
    index: true,
    caseSensitive: void 0,
    module: route3
  },
  "routes/customize.$handle": {
    id: "routes/customize.$handle",
    parentId: "root",
    path: "customize/:handle",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/api.mock-upload": {
    id: "routes/api.mock-upload",
    parentId: "root",
    path: "api/mock-upload",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/api.upload-url": {
    id: "routes/api.upload-url",
    parentId: "root",
    path: "api/upload-url",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/example-form": {
    id: "routes/example-form",
    parentId: "root",
    path: "example-form",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route8
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
