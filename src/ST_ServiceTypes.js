// const debounce = require('debounce-promise');
var Service;

class ServiceTest {
    constructor(name, testfn) {
        this.ImplementsService = testfn;
        this.Name = name;
    }
}

let serviceMap = {
    "mode": Service.Switch,
    "routine": Service.Switch,
    "fan": Service.Fanv2,
    "windowShade": Service.WindowCovering,
    "light": Service.Lightbulb,
    "colorLight": Service.Lightbulb,
    "speaker": Service.Speaker,
    "sonos": Service.Speaker,
    "thermostat": Service.Thermostat
};

let serviceTests = [
    new ServiceTest("mode", accessory =>  accessory.hasCapability("Mode")),
    new ServiceTest("routine", accessory => accessory.hasCapability("Routine")),
    new ServiceTest("fan", accessory => (accessory.hasCapability('Fan') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Fan Speed') || accessory.hasCapability('Fan Control') || accessory.hasCommand('setFanSpeed') || accessory.hasCommand('lowSpeed') || accessory.hasAttribute('fanSpeed'))),
    new ServiceTest("windowShade", accessory => (accessory.hasCapability('Window Shade') && (accessory.hasCommand('levelOpenClose') || accessory.hasCommand('presetPosition')))),
    new ServiceTest("light", accessory => (accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.includes('light'))),
    new ServiceTest("colorLight", accessory => (accessory.hasAttribute('saturation') || accessory.hasAttribute('hue') || accessory.hasAttribute('colorTemperature') || accessory.hasCapability("Color Control"))),
    new ServiceTest("speaker", accessory => accessory.hasCapability('Speaker')),
    new ServiceTest("sonos", accessory => (accessory.context.deviceData.manufacturerName === "Sonos")),
    new ServiceTest("thermostat", accessory => (accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState')))
];

function lookupServiceType(name) {
    if (serviceMap[name]) {
        return serviceMap[name];
    }

    return null;
}

module.exports = class ServiceTypes {
    constructor(accessories, srvc, char) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.temperature_unit = accessories.temperature_unit;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        Service = srvc;
        this.homebridge = accessories.homebridge;
    }

    determineServiceType(accessory) {
        for (var i = 0; i < serviceTests.length; i++) {
            ver serviceTest = serviceTests[i];

            if (serviceTest.ImplementsService(accessory)) {
                this.log.info("Service type of '" + serviceTest.Name + "' detected.");
                return lookupServiceType(serviceTest.Name);
            }
        }

        return null;
    }
}