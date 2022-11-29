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


import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import T from 'i18n-react';
import iodaLogo from 'images/logos/ioda-logo.svg';
import {  ThemeProvider, withStyles,createTheme } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Switch,FormControlLabel, Typography,Tooltip } from '@material-ui/core';

const useStyles = (theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 90,
      display: "flex",
      flexDirection: "row"
    },
  });

  const theme = createTheme({
    palette: {
      type: 'dark',
    },
  });

  const LightTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1]
    },
  }))(Tooltip);

  const label = { inputProps: { 'aria-label': 'view-toggle' } };

class Nav extends Component { 
    constructor(props) {
        super(props);
        this.state = {
            language: localStorage.getItem("lang") ? localStorage.getItem("lang") : "en" ,
            toggle: localStorage.getItem('simplified_view') == 'true'
        }
        this.checkbox = React.createRef();
        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toogleSimplifiedView = this.toogleSimplifiedView.bind(this);
    }

    componentDidMount() {
        if(localStorage.getItem("simplified_view") == null){
            localStorage.setItem('simplified_view',"true");
            this.setState({toggle:true})
        }
    }

    toggleMenu(event) {
        this.checkbox.current.click();
    }

    handleChange(event) {
        this.setState({
            language: event.target.value
        },()=> {
            localStorage.setItem("lang",this.state.language);
            window.location.reload(false);
             }
        )
      };

      toogleSimplifiedView(e){
        console.log(e.target.checked)
        localStorage.setItem('simplified_view',e.target.checked);
        window.location.reload(false);
      }

    render() {
        const { classes } = this.props;
        const dashboard = T.translate("header.dashboard");
        const reports = T.translate("header.reports");
        const help = T.translate("header.help");
        const projectInfo = T.translate("header.projectInfo");
        const iodaLogoAltText = T.translate("header.iodaLogoAltText");
        const acknowledgements = T.translate("header.acknowledgements");
        const api = T.translate("header.api");
        const viewToggleHelp = T.translate("header.viewToggleHelp");

        return(
            <div className="header">
                <div className="header__container">
                    <div className="header__logo">
                        <Link to="/">
                            <img src={iodaLogo} alt={iodaLogoAltText} width="97" height="35"/>
                        </Link>
                    </div>
                    <div className="header__menu">
                        <input type="checkbox" className="header__checkbox" ref={this.checkbox} id="nav-toggle" />
                        <label htmlFor="nav-toggle" className="header__button">
                            <span className="header__icon">&nbsp;</span>
                        </label>
                        <div className="header__background"></div>
                        <nav className="header__nav">
                            <ul className="header__list">
                                <li className="header__item">
                                    <Link to="/dashboard" className="header__link" onClick={() => this.toggleMenu()}>
                                        {dashboard}
                                    </Link>
                                </li>
                                <li className="header__item">
                                    <a href="https://api.ioda.inetintel.cc.gatech.edu/v2/" className="header__link" onClick={() => this.toggleMenu()}>
                                        {api}
                                    </a>
                                </li>
                                <li className="header__item">
                                    <Link to="/project" className="header__link" onClick={() => this.toggleMenu()}>
                                        {projectInfo}
                                    </Link>
                                </li>
                                <li className="header__item">
                                    <Link to="/reports" className="header__link" onClick={() => this.toggleMenu()}>
                                        {reports}
                                    </Link>
                                </li>
                                <li className="header__item">
                                    <Link to="/help" className="header__link" onClick={() => this.toggleMenu()}>
                                        {help}
                                    </Link>
                                </li>
                                <li className="header__item">                              
                                <ThemeProvider theme={theme}>
                                    <FormControl className={classes.formControl}>
                                        <Select
                                        value={this.state.language}
                                        onChange={this.handleChange}
                                        inputProps={{MenuProps: {disableScrollLock: true}}}                                  
                                        >
                                            <MenuItem key={"en"} value={"en"}>English</MenuItem>
                                            <MenuItem key={"fa"} value={'fa'}>Farsi</MenuItem>
                                        </Select>
                                        <div style={{marginLeft: "2em"}}>
                                        <LightTooltip title={<Typography variant='h5'>{viewToggleHelp}</Typography>}>
                                            <FormControlLabel
                                                control={<Switch {...label} onChange={this.toogleSimplifiedView} checked={this.state.toggle} />}
                                                label={<Typography style={{color:"white"}}>{this.state.toggle?"Simplified":"Advanced"}</Typography>}
                                            /> 
                                        </LightTooltip>
                                        </div>
                                    </FormControl> 
                                </ThemeProvider>
                        </li>
                        </ul>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles)(Nav);
