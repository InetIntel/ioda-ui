/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

/*
 * Portions of this source code are Copyright (c) 2021 Georgia Tech Research
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
import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
// Internationalization
import T from 'i18n-react';

// Images
import comcast from 'images/acknowledgements/comcast.svg';
import dhs from 'images/acknowledgements/dhs.svg';
import digitalElement from 'images/acknowledgements/digital-element.png';
import isoc from 'images/acknowledgements/ISOC.png';
import nersc from 'images/acknowledgements/nersc.png';
import nsf from 'images/acknowledgements/nsf.svg';
import otf from 'images/acknowledgements/otf.png';
import sdsc from 'images/acknowledgements/sdsc.svg';
import ucsd from 'images/acknowledgements/ucsd.svg';
import usdos from 'images/acknowledgements/usdos.png';
import xsedeBlack from 'images/acknowledgements/xsede-black.png';
import caida from 'images/logos/caida.png';
import {Helmet} from "react-helmet";


const data = [
    {
        src: nsf,
        href: "https://www.caida.org/funding/ioda/",
        text: `The development of this platform at UC San Diego was supported by NSF grant CNS-1228994 [Detection and Analysis of Large-scale Internet Infrastructure Outages (IODA)].`
    },
    {
        src: dhs,
        href: 'https://www.dhs.gov',
        text: `The development of this platform at UC San Diego was also supported by Department of Homeland Security Science and Technology Directorate (DHS S&T) contract 70RSAT18CB0000015 [IODA-NP: Multi-source Realtime Detection of Macroscopic Internet Connectivity Disruption], and DHS S&T cooperative agreement FA8750-12-2-0326 [Supporting Research and Development of Security Technologies through Network and Security Data Collection].`
    },
    {
        src: otf,
        href: 'https://www.opentech.fund/results/supported-projects/internet-outage-detection-and-analysis/',
        text: `This platform was also supported by the Open Technology Fund under contract number 1002-2018-027.`
    },
    {
        src: isoc,
        href: 'https://insights.internetsociety.org/',
        text: `Additional funding to support this platform was generously provided by a grant from the Internet Society.`,
    },
    {
        src: comcast,
        href: 'https://innovationfund.comcast.com/',
        text: 'Additional funding to work on visualization interfaces was generously provided by a Comcast research grant.',
    },
    {
        src: nersc,
        href: 'https://www.nersc.gov',
        text: 'Storage resources for the UCSD Network Telescope were supported by NERSC, a DOE Office of Science User Facility supported by the Office of Science of the U.S. Department of Energy under Contract No. DE-AC02-05CH11231.'
    },
    {
        src: xsedeBlack,
        href: 'https://www.xsede.org',
        text: 'Computational resources were supported by National Science Foundation grant number ACI-1053575.',
    },
    {
        src: sdsc,
        href: 'https://www.sdsc.edu',
        text: 'This project was originally developed at CAIDA, San Diego Supercomputer Center, UC San Diego.',
    },
    {
        src: ucsd,
        href: 'https://www.ucsd.edu',
        text: 'This project was originally developed at CAIDA, UC San Diego.',
    },
    {
        src: usdos,
        html: <Fragment>
            This platform was/is supported by the <a href="https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/bureau-of-democracy-human-rights-and-labor/">U.S. Department of State, Bureau of Democracy, Human Rights, and Labor</a> (2020) and <a href="https://www.state.gov/bureaus-offices/under-secretary-for-political-affairs/bureau-of-near-eastern-affairs/">Bureau of Near Eastern Affairs</a> (2021-2022).
        </Fragment>
    },
    {
        src: caida,
        html: <Fragment>
            This project was originally developed at <a href="https://www.caida.org">CAIDA</a>, UC San Diego.
        </Fragment>
    }
]

class Acknowledgements extends PureComponent {

    render() {
        const title = T.translate("header.acknowledgements");
        // const center = {
        //     display: "flex",
        //     justifyContent: "center"
        // }

        const projectElements = []
        for (let i = 0; i < data.length; i += 4) {
            const projects = []
            for (let j = i; j < Math.min(i + 4, data.length); j += 1) {
                const { src, href, html = null, text = null } = data[j];

                const thumbnailContent = <div className="thumbnail">
                        <div className="thumbnail__content">
                        <div className="thumbnail__img">
                            <img src={src} />
                        </div>
                        <p className="thumbnail__text">
                            {html && html}
                            {!html && text}
                        </p>
                    </div>
                </div>

                projects.push(
                    <div className="col-1-of-4">
                        {href && (
                            <a href={href} target="_blank">
                                {thumbnailContent}
                            </a>
                        )}
                        {!href && thumbnailContent}
                    </div>
                )
            }

            projectElements.push(
                <div className="row">{projects}</div>
            )
        }

        return (
            <div className="acknowledgements">
                <Helmet>
                    <title>IODA | Acknowledgements</title>
                    <meta name="description" content="Contributing partners to IODA's internet outage detection processes and software" />
                </Helmet>
                <div className="row">
                    <div className="col-1-of-1">
                        <h1 className="section-header">{title}</h1>
                        <h2>Support</h2>
                    </div>
                </div>
                {projectElements}
                <div className="row">
                    <h2 id="data">Data Sources</h2>
                    <p>See the <a href="http://www.caida.org/projects/ioda/">IODA project page</a> for scientific
                        references and for more information about our methodology. </p>
                    <h4>Global Internet Routing Data</h4>
                    <ul>
                        <li>RIPE NCC's <a href="http://ris.ripe.net/">Routing Information Service (RIS)</a></li>
                        <li>University of Oregon's <a href="http://www.routeviews.org/">Route Views Project</a></li>
                    </ul>
                    <h4>Internet Background Radiation Data</h4>
                    <ul>
                        <li>The <a href="https://www.merit.edu/initiatives/orion-network-telescope/">Merit Network
                            Telescope</a></li>
                    </ul>
                    <h4>Active Probing Data</h4>
                    <ul>
                        <li>Active measurements conducted from Georgia Tech servers.</li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default Acknowledgements;
