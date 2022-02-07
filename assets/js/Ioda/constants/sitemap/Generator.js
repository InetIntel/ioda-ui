// Tutorial used: https://www.amitsn.com/blog/how-to-generate-a-sitemap-for-your-react-website-with-dynamic-content

require("babel-register")({
    presets: ["env", "react"]
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

        getCountries.data.data.topology.objects["ne_10m_admin_0.countries.v3.1.0"].geometries.map(obj => {
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
