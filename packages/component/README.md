# @shock-collar/react

Digital Leash for Freelancers. Lock client websites until they pay.

## Installation

```bash
npm install @shock-collar/react
```

## Usage

Add the `ShockCollar` component to your client's site (typically in `_app.tsx` or root layout):

```tsx
import { ShockCollar } from "@shock-collar/react";

function App() {
  return (
    <>
      <ShockCollar
        apiKey="sk_live_xxxxxxxxxxxxx"
        dashboardUrl="https://your-shock-collar-dashboard.vercel.app"
      />
      <YourApp />
    </>
  );
}
```

## Props

| Prop           | Type     | Default                                    | Description                                         |
| -------------- | -------- | ------------------------------------------ | --------------------------------------------------- |
| `apiKey`       | `string` | **Required**                               | Your unique API key from the Shock Collar dashboard |
| `dashboardUrl` | `string` | **Required**                               | The URL of your deployed Shock Collar dashboard     |
| `message`      | `string` | `"ACCESS RESTRICTED"`                      | Custom message to display when locked               |
| `subtitle`     | `string` | `"Please contact the site administrator."` | Custom subtitle                                     |

## How It Works

1. You deploy the Shock Collar dashboard and create an API key
2. You embed the `<ShockCollar />` component in your client's site
3. When an invoice is overdue, toggle the lock in your dashboard
4. The client's site immediately shows an "ACCESS RESTRICTED" overlay
5. Once they pay, toggle it back off — site is restored instantly

## Important Notes

- **Fails open**: If the API is unreachable, the site remains unlocked
- **No flash**: The overlay only appears after confirming lock status
- **Lightweight**: Zero dependencies beyond React
- **Customizable**: Override the message and polling interval

## License

MIT
