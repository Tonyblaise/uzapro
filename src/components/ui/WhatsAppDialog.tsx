"use client";
/**
 * Send on WhatsApp (feature 020): the recipient's phone and the message, both editable, and a
 * click-to-chat link. UzaPro sends nothing; the link opens the user's own WhatsApp.
 */
import { useState } from "react";
import {
  noteWhatsApp,
  useCustomerPhone,
  useLastReminder,
  waLink,
} from "@/data";
import { Button } from "./Button";
import { Input, Textarea } from "./Field";
import { Icon } from "./Icon";
import { Modal } from "./Overlay";

export function WhatsAppDialog({
  open,
  name,
  message,
  reminder,
  overTill,
  onClose,
}: {
  open: boolean;
  /** The customer the message is for. */
  name: string;
  message: string;
  /** A payment reminder: it is logged, and the dialog shows the last one. */
  reminder?: boolean;
  overTill?: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Body
      key={`${name}|${message}`}
      name={name}
      message={message}
      reminder={reminder}
      overTill={overTill}
      onClose={onClose}
    />
  );
}

function Body({
  name,
  message,
  reminder,
  overTill,
  onClose,
}: {
  name: string;
  message: string;
  reminder?: boolean;
  overTill?: boolean;
  onClose: () => void;
}) {
  const stored = useCustomerPhone(name);
  const last = useLastReminder(name);
  const [phone, setPhone] = useState(stored);
  const [text, setText] = useState(message);
  const href = text.trim() ? waLink(phone, text) : null;
  return (
    <Modal
      open
      overTill={overTill}
      title="Send on WhatsApp"
      subtitle={name}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                noteWhatsApp(name, reminder);
                onClose();
              }}
              className="type-label inline-flex h-[var(--control-height)] items-center gap-2 rounded-md bg-action px-[14px] text-text-on-action no-underline hover:bg-action-hover hover:no-underline"
            >
              <Icon name="message-square" size={16} />
              Open WhatsApp
            </a>
          ) : (
            <Button icon="message-square" disabled>
              Open WhatsApp
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Phone number"
          type="tel"
          value={phone}
          hint={
            href || !text.trim()
              ? undefined
              : "Enter a mobile number, for example 0712 345 678"
          }
          onChange={(e) => setPhone(e.target.value)}
        />
        <Textarea
          label="Message"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {reminder && last && (
          <p className="type-small m-0 text-text-secondary">
            Last reminded {last}
          </p>
        )}
        <p className="type-small m-0 text-text-muted">
          This opens WhatsApp with the message ready. You press send there.
        </p>
      </div>
    </Modal>
  );
}
