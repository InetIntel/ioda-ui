## Configuring Application Alerts
This application supports configurable alerts that can be displayed on the top of the page. These alerts can be customized to display `info`, `success`, `warning`, or `error` messages according to your needs.

### How to Configure Alerts
To configure or change an `alert`, locate the alert state in the `/ioda-ui/assets/js/ioda/index.js`. Here’s what each part of the alert state means:

 - `title` (required): The main message or headline of the alert.
 - `description` (optional): Additional details about the alert.
 - `type` (required): The nature of the alert, which can change its color and icon. Possible values include:
   - `AlertStatus.Info`: Displays the alert in blue, typically used for info messages. 
   - `AlertStatus.Success`: Displays the alert in green, typically used for success messages.
   - `AlertStatus.Warning`: Displays the alert in yellow, typically used for warnings. 
   - `AlertStatus.Error`: Displays the alert in red, typically used for errors.
### Examples
1. To set a Success Alert with a description:
```
alert: {
    title: "Operation Successful",
    description: "The data has been successfully updated.",
    type: AlertStatus.Success
}
```

2. To set a Warning Alert without a description:
```
alert: {
    title: "Low Disk Space",
    type: AlertStatus.Warning
}
```

3. To disable all Alerts:To completely disable alerts, comment out or remove the alert configuration in the code. For example:
```
alert: {
    // title: "Welcome to Our Application",
    // description: "This is an optional alert description.",
    // type: AlertStatus.Success
}
```

### Updating Alert Configuration
To update the alert settings:

1. Open the file where the alert state is defined. 
2. Modify the `title`, `description`, and `type` as required. 
3. Ensure that the `title` and `type` fields are always provided if the alert is to be displayed. 
4. If the alert should not display any message, either comment out or remove the `title`, `description`, and `type` lines as shown in the "To disable all Alerts" example.

### Notes
 - Always ensure that the `type` of the alert corresponds with the message intention to maintain user clarity.