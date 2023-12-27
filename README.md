
# Open Source BSV-20 Indexer by FireSat.io

Welcome to the documentation for the open-source BSV-20 indexer developed by FireSat.io. This powerful indexer allows you to explore and interact with the BSV-20 layer seamlessly. We encourage developers to not only use this tool but also actively contribute to its improvement.

### Contribution and Bug Reports

Feel free to explore the codebase and contribute by refactoring or enhancing its functionality. We highly appreciate bug reports, and as a token of gratitude, rewards will be provided for valuable contributions. Your involvement helps make the BSV-20 indexer even more robust.

Join us in shaping the future of BSV-20 indexing and contribute to the open-source community. Your expertise is valued, and together we can create a more efficient and reliable BSV-20 indexing solution.

## Minimum System Requirements

Ensure that your system meets the following minimum requirements for optimal performance:

- **8 GB RAM**
- **4 CPU Cores**
- **1 Gbps Bandwidth**

## Configuration for .env File

To customize the behavior of the BSV-20 indexer, you can modify the following parameters in the .env file:

```env
# BSV-20 Indexer API Server Configuration
SERVER_NAME = "BSV20 indexer api server"
SERVER_ADDRESS = "127.0.0.1"
PORT = 5050

# MySQL Database Configuration
MYSQL_USER = "root"
MYSQL_ROOT_PASSW = "<your_mysql_database_password>"
MYSQL_DB_BSV20 = "bsv20"
MYSQL_POOL_CONN_MAX = "<max_pool_connections | recommended 151 or more >"

# Jungle Bus Configuration
JB_BASE_URL = "junglebus.gorillapool.io"
JB_SUB_ID = "<jungle_bug_subscription_id>"
JB_SUB_HEIGHT = "<jungle_bus_subscription_block_height>"
```

Ensure you replace `<your_mysql_database_password>`, `<max_pool_connections>`, `<jungle_bug_subscription_id>`, and `<jungle_bus_subscription_block_height>` with your specific configurations.

## Jungle Bus Subscription Configurations

For the Jungle Bus subscription, the BSV-20 indexer utilizes the following configurations:

- **Output Type:** ord
- **Context:** application/bsv-20
- **Data keys:** tick=QlNWUw==,tick=RklSRQ==,tick=RFJBRw==,QklaQQ==

These settings define the interaction with the Jungle Bus service and help in processing BSV-20 data effectively.

Feel free to explore and modify these configurations to suit your specific requirements. If you have any questions or need assistance, please refer to the FireSat.io community.

## Contact

For any inquiries, support, or community discussions, feel free to reach out to us on the following platforms:

- **Telegram:** [Join our Telegram group](https://t.me/firesats)
- **Twitter:** [Follow us on Twitter](https://twitter.com/FiresatWallet)

Stay connected with FireSat.io and the BSV-20 indexer community for the latest updates, announcements, and collaborative discussions. 