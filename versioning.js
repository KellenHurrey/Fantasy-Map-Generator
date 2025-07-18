"use strict";
/**
 * Version Control Guidelines
 * --------------------------
 * We use Semantic Versioning: major.minor.patch. Refer to https://semver.org
 * Our .map file format is considered the public API.
 *
 * Update the version MANUALLY on each merge to main:
 * 1. MAJOR version: Incompatible changes that break existing maps
 * 2. MINOR version: Additions or changes that are backward-compatible but may require old .map files to be updated
 * 3. PATCH version: Backward-compatible bug fixes and small features that do not affect the .map file format
 *
 * Example: 1.102.2 -> Major version 1, Minor version 102, Patch version 2
 */

const VERSION = "1.108.11";
if (parseMapVersion(VERSION) !== VERSION) alert("versioning.js: Invalid format or parsing function");

{
  document.title += " v" + VERSION;
  const loadingScreenVersion = document.getElementById("versionText");
  if (loadingScreenVersion) loadingScreenVersion.innerText = `v${VERSION}`;

  const storedVersion = localStorage.getItem("version");
  if (compareVersions(storedVersion, VERSION, {major: true, minor: true, patch: false}).isOlder) {
    setTimeout(showUpdateWindow, 6000);
  }

  function showUpdateWindow() {
    const changelog = "https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Changelog";
    const reddit = "https://www.reddit.com/r/FantasyMapGenerator";
    const discord = "https://discordapp.com/invite/X7E84HU";
    const patreon = "https://www.patreon.com/azgaar";

    alertMessage.innerHTML = /* html */ `The Fantasy Map Generator is updated up to version <strong>${VERSION}</strong>. This version is compatible with <a href="${changelog}" target="_blank">previous versions</a>, loaded save files will be auto-updated.
      ${storedVersion ? "<span>Click on OK and then reload the page to fetch fresh code.</span>" : ""}

      <ul>
        <strong>Latest changes:</strong>
        <li>Ability to set custom image as Marker or Regiment icon</li>
        <li>Submap and Transform tools rework</li>
        <li>Azgaar Bot to answer questions and provide help</li>
        <li>Labels: ability to set letter spacing</li>
        <li>Zones performance improvement</li>
        <li>Notes Editor: on-demand AI text generation</li>
        <li>New style preset: Dark Seas</li>
        <li>New routes generation algorithm</li>
        <li>Routes overview tool</li>
        <li>Configurable longitude</li>
        <li>Preview villages map</li>
        <li>Ability to render ocean heightmap</li>
      </ul>

      <p>Join our <a href="${discord}" target="_blank">Discord server</a> and <a href="${reddit}" target="_blank">Reddit community</a> to ask questions, share maps, discuss the Generator and Worlbuilding, report bugs and propose new features.</p>
      <span><i>Thanks for all supporters on <a href="${patreon}" target="_blank">Patreon</a>!</i></span>`;

    $("#alert").dialog({
      resizable: false,
      title: "Fantasy Map Generator update",
      width: "28em",
      position: {my: "center center-4em", at: "center", of: "svg"},
      buttons: {
        "Clear cache": () => cleanupData(),
        "Don't show again": function () {
          $(this).dialog("close");
          localStorage.setItem("version", VERSION);
        }
      }
    });
  }
}

async function cleanupData() {
  await clearCache();
  localStorage.clear();
  localStorage.setItem("version", VERSION);
  localStorage.setItem("disable_click_arrow_tooltip", "true");
  location.reload();
}

async function clearCache() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
}

function parseMapVersion(version) {
  let [major, minor, patch] = version.split(".");

  if (patch === undefined) {
    // e.g. 1.732
    minor = minor.slice(0, 2);
    patch = minor.slice(2);
  }

  // e.g. 0.7b
  major = parseInt(major) || 0;
  minor = parseInt(minor) || 0;
  patch = parseInt(patch) || 0;

  return `${major}.${minor}.${patch}`;
}

function isValidVersion(versionString) {
  if (!versionString) return false;
  const [major, minor, patch] = versionString.split(".");
  return !isNaN(major) && !isNaN(minor) && !isNaN(patch);
}

function compareVersions(version1, version2, options = {major: true, minor: true, patch: true}) {
  if (!isValidVersion(version1) || !isValidVersion(version2)) return {isEqual: false, isNewer: false, isOlder: false};

  let [major1, minor1, patch1] = version1.split(".").map(Number);
  let [major2, minor2, patch2] = version2.split(".").map(Number);

  if (!options.major) major1 = major2 = 0;
  if (!options.minor) minor1 = minor2 = 0;
  if (!options.patch) patch1 = patch2 = 0;

  const isEqual = major1 === major2 && minor1 === minor2 && patch1 === patch2;
  const isNewer = major1 > major2 || (major1 === major2 && (minor1 > minor2 || (minor1 === minor2 && patch1 > patch2)));
  const isOlder = major1 < major2 || (major1 === major2 && (minor1 < minor2 || (minor1 === minor2 && patch1 < patch2)));

  return {isEqual, isNewer, isOlder};
}
