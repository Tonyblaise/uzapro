# Research

## R1. Mechanism

**Decision**: `https://wa.me/<number>?text=<encoded message>`, opened by the user in a new tab
from a real `<a>` with `rel="noopener noreferrer"`.

**Rationale**: works on phone and desktop, needs no account or API, and the user sees and sends
the message themselves.

## R2. Phone numbers

**Decision**: strip spaces and punctuation; accept `+2547…`, `2547…`, `07…`, `7…` (and the `1…`
range); output `2547XXXXXXXX`. Anything else is invalid.

## R3. What is logged

**Decision**: that the link was used, with the time, per customer, for reminders only. The app
cannot know whether the message was sent.

## R4. Access

**Decision**: Read. Sending a copy of a document changes nothing in the app.
