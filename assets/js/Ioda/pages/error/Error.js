import React, { Component } from "react";
import { Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export const Error = ({ error }) => {
  return (
    <div className="app">
      <div className="w-full p-8">
        <div className="max-cont">
          <Alert
            message="Uh oh! IODA encountered an unexpected error. Try reloading the page."
            description={
              <Button
                size="large"
                type="primary"
                className="mt-4 mx-auto"
                onClick={() => window.location.reload()}
                icon={<ReloadOutlined />}
              >
                Reload Page
              </Button>
            }
            type="error"
            showIcon
          />

          <Alert
            className="mt-4"
            message="Error Details"
            description={
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {error.stack ?? "Unknown error stack"}
              </pre>
            }
            type="error"
            showIcon
          />
        </div>
      </div>
    </div>
  );
};

export default Error;
