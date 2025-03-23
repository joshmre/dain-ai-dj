# DJ Butterfly

This project allows users to generate songs with customizable genres and subjects using AI. The DJ Butterfly assistant helps you create music based on your preferences and continuously fetches the audio URL until your song is generated.

[See our demo video](https://www.youtube.com/watch?v=uxPp8hf-0mA)

## Prerequisites

- Node.js and npm installed
- Ngrok (for local testing)
- Express installed
- Dain Protocol CLI (@dainprotocol/cli installed globally)
- .env file with necessary credentials set up (e.g., DAIN_API_KEY, SUNO_API_KEY)
## Technologies Used
**Express**: Web server framework used to handle HTTP requests and real-time communication.

**ngrok**: Tool for exposing local servers to the internet for testing and integration.

**Dain Protocol**: A framework that helps developers build and connect tools to make AI assistants more powerful and useful.

**Suno AI**: A music generation service that uses Suno V4 API to create professional, watermark-free music based on user prompts.


## Setup Instructions

To run this project locally:

### 1. Clone the Repository

```bash
    git clone https://github.com/joshmre/dj-butterfly.git
    cd dj-butterfly
```

### 2. Install Dependencies

Make sure you have npm installed, then run the following:

```bash
    npm install
```

Install the necessary Express and Flask dependencies:

```bash
    npm install express
    npm install -g @dainprotocol/cli
```

### 3. Set Up the .env.development file

Create a .env.development file in the root directory and set your necessary variables for DAIN_API_KEY and SUNO_API_KEY.

Example:
```bash
DAIN_API_KEY=<YOUR-DAIN-API-KEY>
PORT=
SUNO_API_KEY=<YOUR-SUNO-API-KEY>
```

### 4. Start the application

Open two separate terminal windows:

**Terminal 1 (Run ngrok)**

Navigate to the project folder and start ngrok to expose your local server to the internet. By default, it will run on port 3001:

```bash
    ngrok http 3001
```
Once ngrok is running, it will provide a new URL for your ngrok server, which you will use for the callback URL. This URL (line 75 in src/index.ts) should be changed to something like https://<your-ngrok-id>.ngrok-free.app.

Example:
```bash
    callBackUrl: "<your-ngrok-free-link-app>/webhook",
```

Terminal 2 (Run npm):

Run the application:

```bash
    npm run dev
```

### 5. Add the Dain AI URL to Butterfly Assistant

Once your application is running, you'll receive the Dain-AI URL. Use this URL to add the new service on the Butterfly Assistant interface.

### 6. Generate Music

Now, you can interact with the Butterfly Assistant. Ask the assistant to create a song with the subject and genre of your choice, and the assistant will continue fetching the audio URL until your song is generated!

