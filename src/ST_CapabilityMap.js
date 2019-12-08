// const debounce = require('debounce-promise');
var Service, Characteristic;
var CapabilityInitializers = require("./ST_CapabilityInitializers");

let capabilityMap = {
    "Switch": CapabilityInitializers.switch_capability,
    "Light",
    "LightBulb",
    "Bulb",
    "Color Control",
    "Door",
    "Window",
    "Battery",
    "Polling",
    "Lock",
    "Refresh",
    "Lock Codes",
    "Sensor",
    "Actuator",
    "Configuration",
    "Switch Level",
    "Temperature Measurement",
    "Motion Sensor",
    "Color Temperature",
    "Illuminance Measurement",
    "Contact Sensor",
    "Acceleration Sensor",
    "Door Control",
    "Garage Door Control": CapabilityInitializers.garage_door,
    "Relative Humidity Measurement",
    "Presence Sensor",
    "Carbon Dioxide Measurement",
    "Carbon Monoxide Detector",
    "Water Sensor",
    "Window Shade",
    "Valve",
    "Energy Meter",
    "Power Meter",
    "Thermostat",
    "Thermostat Cooling Setpoint",
    "Thermostat Mode",
    "Thermostat Fan Mode",
    "Thermostat Operating State",
    "Thermostat Heating Setpoint",
    "Thermostat Setpoint",
    "Fan Speed",
    "Fan Control",
    "Fan Light",
    "Fan",
    "Speaker",
    "Tamper Alert",
    "Alarm",
    "Alarm System Status",
    "AlarmSystemStatus",
    "Mode",
    "Routine",
    "Button": CapabilityInitializers.button,
    // Sonos Capabilities
    "Audio Volume",
    "Audio Mute"
};

module.exports = class CapabilityMap {
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
        Characteristic = char;
        this.homebridge = accessories.homebridge;
    }

    get knownCapabilities() {
        return Object.keys(capabilityMap);
    }

    initializeCapability(name, accessory, service) {
        if (capabilityMap[name]) {
            return capabilityMap[name](accessory, service);
        }

        return accessory;
    }
}