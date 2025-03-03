import React, {useRef, useEffect} from "react";
import { useState } from "react";
import { Breadcrumb } from 'antd';
import countries from "../../constants/countries.json";

import {fetchData} from "../../data/ActionCommons";


const DynamicBreadCrumb = ({entityCode, entityType, getCountryCodeFromRegion}) => {
    const [items, setItems] = useState([]);
    const regionCodeNameMapRef = useRef({});
    const asnCodeNameMapRef = useRef({});

    const getCountryNameFromCode = (code) => {
        const country =  countries.filter(country => country.code === code);
        if(country.length > 0){
            return country[0].name;
        }
        return null;
    }

    const getRegionNameFromCode = async (code) => {
        if (regionCodeNameMapRef.current[code]) {
            return regionCodeNameMapRef.current[code];
        }
        const url = `/entities/query?entityType=region&entityCode=${code}`;
        const fetched = await fetchData({url});
        const regions = (fetched?.data?.data ?? []);
        const regionName = regions[0].name? regions[0].name : "";
        regionCodeNameMapRef.current[code] = regionName;
        return regionName;
    }

    const getAsnNameFromCode = async (code) => {
        if (asnCodeNameMapRef.current[code]) {

            return asnCodeNameMapRef.current[code];
        }
        const url = `/entities/query?entityType=asn&entityCode=${code}`;
        const fetched = await fetchData({url});
        const asns = (fetched?.data?.data ?? []);
        const asnName = asns[0].name? asns[0].name : "";
        asnCodeNameMapRef.current[code] = asnName;
        return asnName;
    }

    useEffect(() => {

        const fetchItems = async () => {
            let itemsList = [];
            if(!entityType) return;

            switch (entityType) {
                case "country":
                    itemsList = itemsList.concat({title: <a href="/dashboard"> All Countries </a>});
                    if (entityCode != null) {
                        const countryName = getCountryNameFromCode(entityCode);
                        const countryUrl = `/country/${entityCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={countryUrl}> {countryName} </a>
                        });
                    }
                    break;
                case "region":
                    itemsList = itemsList.concat({title: <a href="/dashboard"> All Countries </a>});
                    const countryCode = await getCountryCodeFromRegion(entityCode);
                    if (countryCode != null) {
                        const countryName = getCountryNameFromCode(countryCode);
                        const countryUrl = `/country/${countryCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={countryUrl}> {countryName} </a>
                        });
                    }
                    const regionName = await getRegionNameFromCode(entityCode);
                    const regionUrl = `/region/${entityCode}`;
                    itemsList = itemsList.concat({
                        title: <a href={regionUrl}> {regionName} </a>
                    })
                    break;
                case "asn":
                    itemsList = itemsList.concat({title: <a href="/dashboard/asn"> All Networks </a>});
                    if (entityCode.includes("-")) {
                        const [asnCode, geoCode] = entityCode.split("-");
                        const asnName = await getAsnNameFromCode(asnCode);
                        let asnUrl = `/asn/${asnCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={asnUrl}> {asnName} </a>
                        })
                        if (isNaN(geoCode)) { // country
                            const countryName = await getCountryNameFromCode(geoCode);
                            let asnUrl = `/asn/${entityCode}`;
                            itemsList = itemsList.concat({
                                title: <a href={asnUrl}> {countryName} </a>
                            })
                        } else { // region
                            const countryCode = await getCountryCodeFromRegion(geoCode);
                            if (countryCode != null) {
                                const countryName = getCountryNameFromCode(countryCode);
                                const countryUrl = `/asn/${asnCode}-${countryCode}`;
                                itemsList = itemsList.concat({
                                    title: <a href={countryUrl}> {countryName} </a>
                                });
                            }
                            const regionName = await getRegionNameFromCode(geoCode);
                            let asnUrl = `/asn/${entityCode}`;
                            itemsList = itemsList.concat({
                                title: <a href={asnUrl}> {regionName} </a>
                            })
                        }
                    }
                    else {
                        const asnName = await getAsnNameFromCode(entityCode);
                        let asnUrl = `/asn/${entityCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={asnUrl}> {asnName} </a>
                        });
                    }
                    break;
            }
            setItems(itemsList);
        }

        fetchItems();
    }, [entityType]);

    return (
        <div className="flex items-start p-3 mb-3">
            {items && <Breadcrumb
                items={items}
            />}
        </div>
    )
}

export default DynamicBreadCrumb;