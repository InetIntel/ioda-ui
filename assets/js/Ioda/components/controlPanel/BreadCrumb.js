import React, {useRef, useEffect} from "react";
import { useState } from "react";
import { Breadcrumb } from 'antd';
import countries from "../../constants/countries.json";

import {fetchData} from "../../data/ActionCommons";


const DynamicBreadCrumb = ({searchParams, entityCode, entityType, getCountryCodeFromRegion}) => {
    const regionSearchParam = useState(searchParams?.get("region") || null);
    const countrySearchParam = useState(searchParams?.get("country") || null);
    const asnSearchParam = useState(searchParams?.get("asn") || null);
    const [items, setItems] = useState([]);



    const getCountryNameFromCode = (code) => {
        const country =  countries.filter(country => country.code === code);
        if(country.length > 0){
            return country[0].name;
        }
        return null;
    }

    const getRegionNameFromCode = async (code) => {

        const url = `/entities/query?entityType=region&entityCode=${code}`;
        const fetched = await fetchData({url});
        const regions = (fetched?.data?.data ?? []);
        return regions[0].name? regions[0].name : "";
    }

    const getAsnNameFromCode = async (code) => {
        const url = `/entities/query?entityType=asn&entityCode=${code}`;
        const fetched = await fetchData({url});
        const asns = (fetched?.data?.data ?? []);
        return asns[0].name? asns[0].name : "";
    }

    useEffect(() => {

        const fetchItems = async () => {
            let itemsList = [];
            if(!entityType) return;

            switch (entityType) {
                case "country":
                    itemsList = itemsList.concat({title: <a href="/dashboard"> All Countries </a>});
                    if(entityCode != null) {
                        const countryName = getCountryNameFromCode(entityCode);
                        const countryUrl = `/country/${entityCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={countryUrl}> {countryName} </a>
                        });
                    }
                    if(regionSearchParam[0] != null) {
                        const regionName = await getRegionNameFromCode(regionSearchParam[0]);
                        const regionUrl = `/country/${entityCode}?region=${regionSearchParam[0]}`;
                        itemsList = itemsList.concat({
                            title: <a href={regionUrl}> {regionName} </a>
                        })
                    }
                    else if(asnSearchParam[0] != null) {
                        const asnName = await getAsnNameFromCode(asnSearchParam[0]);
                        const asnUrl = `/country/${entityCode}?asn=${asnSearchParam[0]}`;
                        itemsList = itemsList.concat({
                            title: <a href={asnUrl}> {asnName} </a>
                        })
                    }
                    break;
                case "region":
                    itemsList = itemsList.concat({title: <a href="/dashboard"> All Countries </a>});
                    const countryCode = await getCountryCodeFromRegion(entityCode);
                    if(countryCode != null) {
                        const countryName = getCountryNameFromCode(countryCode);
                        const countryUrl = `/country/${entityCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={countryUrl}> {countryName} </a>
                        });
                    }
                    if(entityCode != null) {
                        const regionName = await getRegionNameFromCode(entityCode);
                        const regionUrl = `/region/${entityCode}`;
                        itemsList = itemsList.concat({
                            title: <a href={regionUrl}> {regionName} </a>
                        })
                    }
                    break;
                case "asn":
                    itemsList = itemsList.concat({title: <a href="/asn"> All Networks </a>});
                    if(countrySearchParam[0] != null) {
                        itemsList = [];
                        itemsList = itemsList.concat({title: <a href="/country"> All Countries </a>});
                        const countryName = getCountryNameFromCode(countrySearchParam[0]);
                        const countryUrl = `/country=${countrySearchParam[0]}`;
                        itemsList = itemsList.concat({
                            title: <a href={countryUrl}> {countryName} </a>
                        })
                    }
                    if(entityCode != null) {
                        const asnName = await getAsnNameFromCode(entityCode);
                        let asnUrl = `/asn/${entityCode}`;
                        if(countrySearchParam[0] != null) {
                            asnUrl += `?country=${countrySearchParam[0]}`;
                        }
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