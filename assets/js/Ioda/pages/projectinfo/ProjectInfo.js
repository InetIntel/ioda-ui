// React Imports
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';
import {Helmet} from "react-helmet";


class ProjectInfo extends PureComponent {

    render() {
        const title = T.translate("projectinfo.title");
	const text = T.translate("projectinfo.text");
	const link1 = T.translate("projectinfo.link1");	// TODO rename
    const center = {
        display: "flex",
        justifyContent: "center"
    }

	return (
	    <div className="reports">
            <p style={center}>
                For inquiries of feedback please contact the IODA team at Georgia Tech’s &nbsp;<a href="https://inetintel.notion.site/Internet-Intelligence-Research-Lab-d186184563d345bab51901129d812ed6" target="_blank">Internet Intelligence Lab</a>: <a href="mailto:ioda-info@cc.gatech.edu">ioda-info@cc.gatech.edu</a>.</p>
                <Helmet>
                    <title>IODA | Project Information</title>
                    <meta name="description" content="More detailed information about the IODA project."/>
                </Helmet>
                <div className="row list">
                    <div className="col-1-of-1">
                        <h1 className="section-header">{title}</h1>
                        <p className="projectinfo__text">{text}</p>
                        <p className="projectinfo__text">
                            <a href="https://www.caida.org/projects/ioda/" target="_blank">{link1}</a>
                        </p>
                    </div>
                </div>
        </div>
    );
    }
}

export default ProjectInfo;

