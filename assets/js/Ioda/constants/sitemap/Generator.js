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

// Tutorial used: https://www.amitsn.com/blog/how-to-generate-a-sitemap-for-your-react-website-with-dynamic-content

require("@babel/register")({
    presets: ["@babel/preset-env", "@babel/preset-react"]
});
const axios = require('axios');
const {merge} = require("lodash");
const router = require("./Routes").default;
const Sitemap = require("react-router-sitemap").default;

async function generateSitemap() {
    try {
        const url = 'http://api.ioda.inetintel.cc.gatech.edu/v2/topo/country';
        const axiosConfig = {
            method: "get",
            url: ""
        };

        const configHeader = merge({}, axiosConfig, {
            headers: {
                "x-requested-with": "XMLHttpRequest",
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            url: url
        });

        const getCountries = await axios(configHeader);


        let entityCodeMap = [];

        getCountries.data.data.topology.objects["ne_10m_admin_0.countries"].geometries.map(obj => {
            const formattedObj = obj.properties.usercode.replace(':', '/');
            entityCodeMap.push(formattedObj);
        });

        const routeConfig = {
            '/country/:entityCode': [{entityCode: entityCodeMap}]
        };

        return (
            new Sitemap(router)
                .applyParams(routeConfig)
                .build("https://ioda.inetintel.cc.gatech.edu")
                .save("./public/sitemap.xml")
        );
    } catch(e) {
        console.log(e);
    }
}

generateSitemap();
