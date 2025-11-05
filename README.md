# Mess Connect

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/savagetongue/mess-connect1)

A comprehensive, subscription-based management platform for mess halls, seamlessly connecting students, managers, and admins.

Mess Connect is a modern, minimalist web application designed to streamline mess hall operations. It features distinct, secure portals for Students, Managers, and Admins, plus a seamless guest payment option. The entire platform is built on a robust, serverless architecture using Cloudflare Workers and Durable Objects, guaranteeing data persistence, scalability, and a fast user experience.

## Key Features

### For Students
- **Simple Registration:** Easy sign-up with email and password, followed by manager approval.
- **Weekly Menu:** View the upcoming weekly food menu at a glance.
- **Dues Management:** Check monthly dues and payment status.
- **Secure Payments:** Pay mess fees securely online using Razorpay.
- **Feedback System:** Raise complaints with image uploads and provide suggestions.
- **Track Replies:** View manager's responses to complaints and suggestions.

### For Managers
- **Comprehensive Dashboard:** A central hub to oversee all mess operations.
- **Student Management:** Approve, reject, and manage student subscription requests.
- **Menu Control:** Easily create, update, and publish the weekly menu.
- **Financial Tracking:** Real-time dashboard with revenue, pending dues, and guest payment stats.
- **Manual Payment Entry:** Option to mark dues as paid by cash.
- **Communication Hub:** Reply directly to student complaints/suggestions and broadcast messages to all students.

### For Admins
- **Oversight Module:** Monitor manager's responsiveness to student complaints.
- **Transparency:** View full complaint and reply threads to ensure service quality.

### For Guests
- **Effortless Payments:** A simple, no-login-required page for making one-time meal payments.

## Technology Stack

-   **Frontend:** React, React Router, Zustand, shadcn/ui, Tailwind CSS, Framer Motion, Vite
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Language:** TypeScript
-   **Package Manager:** Bun

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated: `bunx wrangler login`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mess-connect.git
    cd mess-connect
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Local Environment Variables:**
    For local development, create a `.dev.vars` file in the root directory. This file is used by Wrangler to load environment variables locally. For production, you will need to set these in your Cloudflare Worker's dashboard.
    ```ini
    # .dev.vars
    RAZORPAY_KEY_ID="your_razorpay_test_key_id"
    RAZORPAY_KEY_SECRET="your_razorpay_test_key_secret"
    ```

### Running the Development Server

To start the development server, which includes the Vite frontend and the Hono backend worker, run:

```bash
bun run dev
```

This will start the Vite development server, and API requests to `/api/*` will be automatically proxied to your local Cloudflare Worker.

## Deployment

This project is designed for easy deployment to Cloudflare Workers.

1.  **Build the project:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    ```bash
    bun run deploy
    ```
    This command will build the application and deploy it using the Wrangler CLI.

3.  **Configure Production Secrets:**
    After deploying, you must configure your environment variables (like Razorpay keys) in the Cloudflare dashboard for your worker.
    -   Navigate to your Worker in the Cloudflare dashboard.
    -   Go to `Settings` > `Variables`.
    -   Add your production `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as secret variables.

Alternatively, deploy directly from your GitHub repository:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/savagetongue/mess-connect1)

## Project Structure

-   `src/`: Contains all the frontend React application code, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Hono backend code that runs on Cloudflare Workers, including API routes and entity definitions for Durable Objects.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and the backend to ensure type safety.

## License

This project is licensed under the MIT License.