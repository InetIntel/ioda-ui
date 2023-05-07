import React, { Component } from 'react';
import T from "i18n-react";

import dayjs from 'dayjs';
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);


class TimeStamp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fade: false,
            messageTop: 0,
            messageLeft: 0,
            screenBelow1024: false
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize.bind(this));
    }

    resize() {
        let screenBelow1024 = (window.innerWidth <= 1024 || navigator.userAgent.match(/(iPad)/));
        if (screenBelow1024 !== this.state.screenBelow1024) {
            this.setState({
                screenBelow1024: screenBelow1024
            });
        }
    }

    copyTimestamp(e, timestamp) {
        // copy to clipboard
        navigator.clipboard.writeText(timestamp);

        // trigger animation
        this.setState({
            fade: true,
            messageTop: event.target.offsetTop - 15,
            messageLeft: this.state.screenBelow1024 ? event.clientX - 105 : event.clientX + 15
        });
    }

    resetFadeState() {
        this.setState({fade: false});
    }

    render() {
        const format = "MMMM D, YYYY h:mma UTC"
        const fromDate = dayjs.utc(this.props.from * 1000).format(format)
        const untilDate = dayjs.utc(this.props.until * 1000).format(format)
        const timestamp = `${fromDate} - ${untilDate}`
        
        const fade = this.state.fade;
        const hoverTitle = T.translate("timestamp.hoverTitle");
        const copyToClipboardMessage = T.translate("timestamp.copyToClipboardMessage");
        return (
            <div className="timestamp" onClick={(e) => this.copyTimestamp(e, timestamp)}>
                <div
                    className={fade ? 'timestamp__message timestamp__fade' : 'timestamp__message'}
                    onAnimationEnd={() => this.resetFadeState()}
                    style={{top: `${this.state.messageTop}px`, left: `${this.state.messageLeft}px`}}
                >
                    {copyToClipboardMessage}
                </div>
                <div className="timestamp__text" title={hoverTitle}>
                    {timestamp}
                </div>
            </div>

        );
    }
}

export default TimeStamp;
