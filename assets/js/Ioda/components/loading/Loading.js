import React from "react";
import T from "i18n-react";

const Loading = ({text}) => {
    return (
        <div className="progress-bar-striped">
            <div style={{ width: "100%" }}>
                <strong>
                    {text ? (
                        <p>{text}</p>
                    ) : (
                        <T.p text="loadingBar.loading" />
                    )}
                </strong>
            </div>
        </div>
    );

}

export default Loading;
