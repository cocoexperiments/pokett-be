# Pokett Backend

Pokett is a serverless expense sharing application that helps users manage and split expenses within groups. This repository contains the backend implementation.

## 🚀 Features (Planned)

- User authentication and authorization
- Group management
- Expense tracking and splitting
- Real-time notifications
- Transaction history
- Settlement suggestions

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **Database**: MongoDB
- **Infrastructure**: AWS Serverless (Lambda, API Gateway)
- **IaC**: AWS CDK

## 📦 Prerequisites

- Node.js (v18 or later)
- npm or yarn package manager
- AWS CLI installed and configured
- MongoDB Atlas account (free tier works)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/cocoexperiments/pokett-be.git
cd pokett-be
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file and add your MongoDB connection string and other required variables.

## 🚀 Deployment

The application is set up to be deployed as a serverless application on AWS using CDK. Here's how to deploy:

1. Bootstrap AWS CDK (one-time setup per AWS account/region):
```bash
npm run cdk bootstrap
```

2. Deploy the stack:
```bash
npm run cdk deploy
```

### Infrastructure Details

The serverless infrastructure includes:

- **AWS Lambda**: Runs the NestJS application (256MB memory, 30s timeout)
- **API Gateway**: Routes HTTP requests to the Lambda function
- **MongoDB Atlas**: Database (using free tier for development)

### Cost Optimization

The infrastructure is designed to be cost-effective:
- Uses Lambda's pay-per-use model
- Minimal memory allocation (256MB)
- API Gateway with HTTP API (cheaper than REST API)
- MongoDB Atlas free tier for development

### Cold Starts

The application may experience cold starts when the Lambda function hasn't been used for a while. To minimize this:
- The Lambda function caches the NestJS server instance
- Uses Node.js runtime for faster cold starts
- Implements efficient bundling with minimal dependencies

## 🏗 Project Structure

```
pokett-be/
├── src/              # Source code
│   └── lambda.ts     # Lambda handler for serverless deployment
├── infra/           # CDK infrastructure code
│   ├── bin/         # CDK app entry point
│   └── lib/         # Stack definitions
├── tests/           # Test files
└── package.json     # Project dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Initial work - Pokett Team 