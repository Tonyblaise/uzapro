import {
  ArrowLeft, ArrowLeftRight, FolderLock, UserCog, ArrowRight, ArrowUpRight, CreditCard, Maximize, Minimize, ScanBarcode, Lightbulb, MessageSquare, Paperclip, Send, Sparkles, ThumbsUp, Wrench, Ban, Banknote, Bell, BookOpen, Boxes, Calculator, Calendar, Camera, ChartColumn, Check, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, CircleAlert, CircleCheck, CircleHelp, ClipboardList, Clock, Copy, Download, Ellipsis, Eye, EyeOff, FileText, Filter, Folder, House,
  Image, Info, Landmark, LayoutGrid, List, Lock, LogOut, Mail, MapPin, Menu, Minus, Package, PackageX, Pencil, Phone, Plus, Printer, Receipt, RefreshCw, Ruler, Search, Settings,
  Sheet, ShoppingCart, Smartphone, SlidersHorizontal, Store, Tag, Trash2, TrendingUp, Truck, Undo2, Upload, User, Users, Wallet, Warehouse, X,
  type LucideIcon,
} from "lucide-react";

/** Design icon names (Lucide names used in the canvas and erp-data.js) → components (research R4). */
const ICONS: Record<string, LucideIcon> = {
  "folder-lock": FolderLock, "user-cog": UserCog, "arrow-left": ArrowLeft, "arrow-left-right": ArrowLeftRight, "arrow-right": ArrowRight, "arrow-up-right": ArrowUpRight, "credit-card": CreditCard, maximize: Maximize, minimize: Minimize, "scan-barcode": ScanBarcode,
  sparkles: Sparkles, "message-square": MessageSquare, lightbulb: Lightbulb, wrench: Wrench, paperclip: Paperclip, send: Send, "thumbs-up": ThumbsUp, ban: Ban, banknote: Banknote, bell: Bell, boxes: Boxes,
  calculator: Calculator, calendar: Calendar, camera: Camera, "chart-column": ChartColumn, check: Check, "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-up": ChevronUp, "circle-alert": CircleAlert,
  "circle-check": CircleCheck, "circle-help": CircleHelp, "clipboard-list": ClipboardList, clock: Clock, copy: Copy, download: Download, ellipsis: Ellipsis, eye: Eye, "eye-off": EyeOff,
  "file-text": FileText, filter: Filter, folder: Folder, house: House, image: Image, info: Info, landmark: Landmark, list: List, lock: Lock, "log-out": LogOut,
  mail: Mail, "map-pin": MapPin, menu: Menu, minus: Minus, package: Package, "package-x": PackageX, pencil: Pencil, phone: Phone, plus: Plus, printer: Printer,
  receipt: Receipt, "refresh-cw": RefreshCw, ruler: Ruler, search: Search, settings: Settings, "shopping-cart": ShoppingCart,
  "sliders-horizontal": SlidersHorizontal, store: Store, tag: Tag, "trash-2": Trash2, "trending-up": TrendingUp, truck: Truck,
  smartphone: Smartphone, "book-open": BookOpen, sheet: Sheet, "layout-grid": LayoutGrid, "undo-2": Undo2, upload: Upload, user: User, users: Users, wallet: Wallet, warehouse: Warehouse, x: X,
};

export type IconName = keyof typeof ICONS | (string & {});

export function Icon({ name, size = 16, stroke = 1.5, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  const C = ICONS[name] ?? CircleHelp;
  return <C size={size} strokeWidth={stroke} absoluteStrokeWidth className={className} aria-hidden="true" focusable="false" />;
}
