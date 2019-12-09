// const debounce = require('debounce-promise');
var Characteristic;
const CapabilityInitializers = require("./ST_CapabilityInitializers");

const capabilityMap = {
    "Switch": CapabilityInitializers.switch_capability,
    "Light": CapabilityInitializers.light,
    "LightBulb": CapabilityInitializers.light,
    "Bulb": CapabilityInitializers.light,
    "Color Control": CapabilityInitializers.light,
    // "Door",
    // "Window",
    "Battery": CapabilityInitializers.battery,
    // "Polling",
    "Lock": CapabilityInitializers.lock,
    // "Refresh",
    // "Lock Codes",
    // "Sensor",
    // "Actuator",
    // "Configuration",
    // "Switch Level",
    "Temperature Measurement": CapabilityInitializers.temperature_sensor,
    "Motion Sensor": CapabilityInitializers.motion_sensor,
    "Color Temperature": CapabilityInitializers.light,
    "Illuminance Measurement": CapabilityInitializers.illuminance_sensor,
    "Contact Sensor": CapabilityInitializers.contact_sensor,
    // "Acceleration Sensor",
    "Door Control": CapabilityInitializers.garage_door,
    "Garage Door Control": CapabilityInitializers.garage_door,
    "Relative Humidity Measurement": CapabilityInitializers.humidity_sensor,
    "Presence Sensor": CapabilityInitializers.presence_sensor,
    "Carbon Dioxide Measurement": CapabilityInitializers.carbon_dioxide,
    "Carbon Monoxide Detector": CapabilityInitializers.carbon_monoxide,
    "Water Sensor": CapabilityInitializers.water_sensor,
    "Window Shade": CapabilityInitializers.window_shade,
    "Valve": CapabilityInitializers.valve,
    "Energy Meter": CapabilityInitializers.energy_meter,
    "Power Meter": CapabilityInitializers.power_meter,
    // "Thermostat",
    // "Thermostat Cooling Setpoint",
    // "Thermostat Mode",
    // "Thermostat Fan Mode",
    // "Thermostat Operating State",
    // "Thermostat Heating Setpoint",
    // "Thermostat Setpoint",
    // "Fan Speed",
    // "Fan Control",
    // "Fan Light",
    "Fan": CapabilityInitializers.fan,
    "Speaker": CapabilityInitializers.speaker,
    // "Tamper Alert",
    // "Alarm",
    "Alarm System Status": CapabilityInitializers.alarm_system,
    "Mode": CapabilityInitializers.virtual_mode,
    "Routine": CapabilityInitializers.virtual_routine,
    "Button": CapabilityInitializers.button,
    // Sonos Capabilities
    // "Audio Volume",
    // "Audio Mute"
};

module.exports = class CapabilityMap {
    constructor(accessories, char) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        // Service = srvc;
        Characteristic = char;
        this.homebridge = accessories.homebridge;
    }

    getKnownCapabilities() {
        return Object.keys(capabilityMap);
    }

    initializeCapability(name, accessory, serviceType) {
        if (capabilityMap[name]) {
            return capabilityMap[name](accessory, serviceType);
        }
        return accessory;
    }
};