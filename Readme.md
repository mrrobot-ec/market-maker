[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mrrobot-ec/market-maker)

# Exchange MidPrice Service

A TypeScript application that calculates global mid-prices from multiple cryptocurrency exchanges (Binance, Huobi, and Kraken) using a clean architecture approach with design patterns.

🚀 **Features**

* **Clean Architecture:** Clear separation between domain, application, infrastructure, and presentation layers
* **SOLID Principles:** Adherence to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles
* **Dependency Injection:** Leveraging InversifyJS for IoC container and dependency management
* **Multiple Exchange Integration:** Support for Binance (WebSocket), Huobi (REST), and Kraken (REST)
* **Resilient WebSocket Handling:** Exponential backoff reconnection strategy for WebSocket connections
* **Metrics and Monitoring:** Performance tracking and exchange reliability metrics
* **API Documentation:** Comprehensive Swagger documentation
* **Graceful Shutdown:** Proper resource cleanup and connection handling

📊 **Architecture**

The application follows a clean architecture approach with four main layers:

* **Domain Layer:** Core business entities and interfaces
* **Application Layer:** Business logic and use cases
* **Infrastructure Layer:** External service implementations and technical concerns
* **Presentation Layer:** API endpoints and documentation

🖼️ ***Class Diagram***

![image info](./imgs/class-diag.png)

🗂 **Project Structure**

```
src/
├── app.ts                      # Application entry point
├── application/                # Core business logic layer
│   ├── MidPriceService.ts
│   ├── MidPriceServiceFactory.ts
│   └── tests/
├── domain/                     # Core entities and interfaces
│   ├── entities/
│   │   ├── GlobalMidPrice.ts
│   │   └── OrderBook.ts
│   ├── interfaces/
│       ├── IExchangeService.ts
│       └── IMidPriceService.ts
├── infrastructure/             # Service implementations and DI container
│   ├── di/                     # Dependency injection setup
│   │   ├── bindings/
│   │   │   ├── loggerBindings.ts
│   │   │   ├── exchangeServicesBindings.ts
│   │   │   └── midPriceBindings.ts
│   │   ├── symbols.ts
│   │   └── container.ts
│   ├── Logger.ts
│   ├── monitoring/             # Metrics and monitoring
│   └── services/
│       ├── rest/
│       │   ├── KrakenRestService.ts
│       │   ├── HuobiRestService.ts
│       │   └── mappers/
│       ├── websocket/
│       │   ├── BaseWebSocketService.ts
│       │   ├── BinanceWebSocketService.ts
│       │   ├── mappers/
│       │   └── types/
│       └── tests/
└── presentation/               # API routes and Swagger documentation
├── swagger.ts
└── v1/
└── routes.ts
```

📑 **API Endpoints**

| Endpoint                    | Method | Description                                                    |
| :-------------------------- | :----- |:---------------------------------------------------------------|
| `/v1/global-mid-price`       | `GET`  | Returns the current global mid-price with exchange data        |
| `/v1/stream-global-mid-price`| `GET`  | Provides a real-time SSE stream of mid-price updates           |
| `/api-docs`                 | `GET`  | Swagger documentation UI                                       |

🔄 **Exchange Services**

The application integrates with multiple cryptocurrency exchanges:

* **Binance:** Real-time order book data via WebSocket connection
* **Huobi:** Order book data via REST API
* **Kraken:** Order book data via REST API

Each exchange service implements the `IExchangeService` interface, allowing for consistent handling across different data sources.

📊 **Metrics and Monitoring**

The application includes a comprehensive metrics system that tracks:

* Calculation success and failure rates
* Exchange-specific reliability metrics
* Performance measurements
* WebSocket connection status

These metrics are available in the response of the endpoints for simplicity but they can be added to a monitoring system like Prometheus, Datadog, or CloudWatch.

📚 **Getting Started**

**Prerequisites**

* Node.js 14.x or higher
* npm or yarn

**Installation**

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/market-maker.git](https://github.com/your-username/market-maker.git)
    cd market-maker
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```

**Running the Application**

**Development Mode**
  ```bash
    npm run dev
  ```

**Running the Application**

**Production Mode**

```bash
  npm start
```

🧪 **Testing**

**Run the test suite**
  ```bash
    npm test
  ```

**Run tests with coverage**
  ```bash
    npm run test:coverage
  ```

🧹 **Linting**
  ```bash
    npm run lint
  ```

🔧 **Future Improvements**

* Add support for environment variables to replace hardcoded API URLs
* Implement persistent storage for metrics
* Add more exchange integrations
* Enhance circuit breaker pattern implementation
* Implement integration tests
* Implement strategy pattern for different global price calculations

📜 **License**

This project is licensed under the MIT License.

Wiki pages you might want to explore:

* [DeepWiki (mrrobot-ec/market-maker)](https://deepwiki.com/mrrobot-ec/market-maker)


