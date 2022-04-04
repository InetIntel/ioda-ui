/*
 * This source code is Copyright (c) 2021 Georgia Tech Research
 * Corporation. All Rights Reserved. Permission to copy, modify, and distribute
 * this software and its documentation for academic research and education
 * purposes, without fee, and without a written agreement is hereby granted,
 * provided that the above copyright notice, this paragraph and the following
 * three paragraphs appear in all copies. Permission to make use of this
 * software for other than academic research and education purposes may be
 * obtained by contacting:
*
 *  Office of Technology Licensing
 *  Georgia Institute of Technology
 *  926 Dalney Street, NW
 *  Atlanta, GA 30318
 *  404.385.8066
 *  techlicensing@gtrc.gatech.edu
 *
 * This software program and documentation are copyrighted by Georgia Tech
 * Research Corporation (GTRC). The software program and documentation are
 * supplied "as is", without any accompanying services from GTRC. GTRC does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for
 * research purposes and is advised not to rely exclusively on the program for
 * any reason.
 *
 * IN NO EVENT SHALL GEORGIA TECH RESEARCH CORPORATION BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING
 * LOST PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION,
 * EVEN IF GEORGIA TECH RESEARCH CORPORATION HAS BEEN ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE. GEORGIA TECH RESEARCH CORPORATION SPECIFICALLY DISCLAIMS ANY
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED
 * HEREUNDER IS ON AN "AS IS" BASIS, AND  GEORGIA TECH RESEARCH CORPORATION HAS
 * NO OBLIGATIONS TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR
 * MODIFICATIONS.
*/

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
                For inquiries or feedback please contact the IODA team at Georgia Tech’s &nbsp;<a href="https://inetintel.notion.site/Internet-Intelligence-Research-Lab-d186184563d345bab51901129d812ed6" target="_blank">Internet Intelligence Lab</a>: ioda-info@cc.gatech.edu.</p>
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

