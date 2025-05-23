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

import T from "i18n-react";

// set language to user's default browser language preference
// ToDo: will eventually allow user to select language via nav, but continue to default to browser option
// let language = window.navigator.userLanguage || window.navigator.language;

export const changeLanguage = (language) => {
  let languageString = "";
  switch (language) {
    case "en":
      languageString = "en";
      break;
    case "fa":
      languageString = "fa";
      break;
    default:
      languageString = "en";
      break;
  }

  // ToDo: would like to change json files out for yml files eventually
  let strings = Object.assign({}, require(`./${languageString}/app.json`));

  let defaultStrings = Object.assign({}, require(`./en/app.json`));

  T.setTexts(strings, {
    notFound: (key) => {
      const defaultStringLocation = key.split(".");
      let defaultString = defaultStrings;
      for (var i = 0; i < defaultStringLocation.length; i++) {
        defaultString = defaultString[defaultStringLocation[i]];
      }
      return `${defaultString}`;
    },
  });
};
changeLanguage(localStorage.getItem("lang") != null ? localStorage.getItem("lang") :"en")

export const CUSTOM_FONT_FAMILY = "Inter, sans-serif";