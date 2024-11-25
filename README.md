# Application
A platform to scan Image/Link and scrab details and List a product automatically. It categorizes products in different sections also you can explore products by clicking in brand name or category.
The analyzation results are dependent on GenAI.
## Installation
```bash
git clone https://github.com/JeevanJoshi4434/ML-Recognized-ECommerce-App.git
```
Server
```bash
cd server

```

Create a KEYS.js in server folder, and edit `server/KEYS.js` file:

```javascript 
export const S3_BUCKET="";
export const AWS_REGION="";
export const AWS_ACCESS_ID="";
export const AWS_ACCESS_SECRET_KEY="";
export const NEXT_PUBLIC_GOOGLE_GEMINI_KEY="";
export const NEXT_PUBLIC_OPENAI_KEY="";
export const APIFY_KEY="";
```
Run server

```bash
npm run start
```

frontend

```bash
cd product-listing
npm run dev
```

Add .env.local Environment file

```bash
NEXT_PUBLIC_BASE_URL="http://localhost:4000"
```
`AWS` config
- Signup to AWS 
- Create S3 bucket, Lambda function
- Create IAM User and give him full permissions of S3, lambda, Rekognition, TranscriptionService
- Claim IAM User API and configure all variables.



