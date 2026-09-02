const URL = "http://localhost:3000/api/auth/send-otp";

const TOTAL_REQUESTS = 55;
const DELAY = 100;

const loginData = {
    email: "test@example.com",
    type: "login"
};

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

async function testRateLimit() {
    console.log("Testing AUTH rate limiter (send-otp endpoint)...");
    console.log(`Sending ${TOTAL_REQUESTS} POST requests to ${URL}\n`);
    console.log("Rate limit: 50 requests per 15 minutes\n");

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.text();

            const remaining = response.headers.get('RateLimit-Remaining') ?? response.headers.get('X-RateLimit-Remaining') ?? 'N/A';
            const reset     = response.headers.get('RateLimit-Reset')     ?? response.headers.get('X-RateLimit-Reset')     ?? 'N/A';

            const tag = response.status === 429 ? '🚫 RATE LIMITED' : (response.status === 200 ? '✅ OK' : `⚠️  ${response.status}`);
            console.log(
                `Request ${String(i).padStart(2)}: [${tag}] | Remaining: ${remaining} | Reset: ${reset}s | Body: ${data.slice(0, 120)}`
            );

        } catch (error) {
            console.error(`Request ${i}: ERROR | ${error.message}`);
        }

        await sleep(DELAY);
    }

    console.log("\nLogin rate limit test completed.");
}

testRateLimit();