// const debounce = require('debounce-promise');
var Characteristic;
const CapabilityInitializers = require("./ST_CharactisticInitializers");

module.exports = class CapabilityClass {
    constructor(accessories, char) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        this.capInitializers = new CapabilityInitializers(accessories, Characteristic);
        Characteristic = char;
        this.homebridge = accessories.homebridge;
    }

    capabilityMap() {
        return {
            "Alarm System Status": this.capInitializers.alarm_system,
            "Mode": this.capInitializers.virtual_mode,
            "Routine": this.capInitializers.virtual_routine,
            "Button": this.capInitializers.button,
            "Switch": this.capInitializers.switch_capability,
            "Light": this.capInitializers.light,
            "LightBulb": this.capInitializers.light,
            "Bulb": this.capInitializers.light,
            "Color Control": this.capInitializers.light,
            "Battery": this.capInitializers.battery,
            "Lock": this.capInitializers.lock,
            "Temperature Measurement": this.capInitializers.temperature_sensor,
            "Motion Sensor": this.capInitializers.motion_sensor,
            "Color Temperature": this.capInitializers.light,
            "Illuminance Measurement": this.capInitializers.illuminance_sensor,
            "Contact Sensor": this.capInitializers.contact_sensor,
            "Door Control": this.capInitializers.garage_door,
            "Garage Door Control": this.capInitializers.garage_door,
            "Relative Humidity Measurement": this.capInitializers.humidity_sensor,
            "Presence Sensor": this.capInitializers.presence_sensor,
            "Carbon Dioxide Measurement": this.capInitializers.carbon_dioxide,
            "Carbon Monoxide Detector": this.capInitializers.carbon_monoxide,
            "Water Sensor": this.capInitializers.water_sensor,
            "Window Shade": this.capInitializers.window_shade,
            "Valve": this.capInitializers.valve,
            "Energy Meter": this.capInitializers.energy_meter,
            "Power Meter": this.capInitializers.power_meter,
            "Thermostat": this.capInitializers.thermostat,
            "Thermostat Operating State": this.capInitializers.thermostat,
            "Fan": this.capInitializers.fan,
            "Speaker": this.capInitializers.speaker,
            "Tamper Alert": this.capInitializers.tamper_sensor,
            // "Door",
            // "Window",
            // "Polling",
            // "Refresh",
            // "Lock Codes",
            // "Sensor",
            // "Actuator",
            // "Configuration",
            // "Switch Level",
            // "Acceleration Sensor",
            // "Thermostat Cooling Setpoint",
            // "Thermostat Mode",
            // "Thermostat Fan Mode",
            // "Thermostat Heating Setpoint",
            // "Thermostat Setpoint",
            // "Fan Speed",
            // "Fan Control",
            // "Fan Light",

            // "Alarm",
            // Sonos Capabilities
            // "Audio Volume",
            "Audio Mute"
        };
    };

    getKnownCapabilities() {
        return Object.keys(this.capabilityMap());
    }

    initializeCapability(name, accessory, serviceType) {
        if (this.capabilityMap()[name]) {
            return this.capabilityMap()[name](accessory, serviceType);
        }
        return accessory;
    }
};