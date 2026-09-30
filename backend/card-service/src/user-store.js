/**
 * Dokra Health - User Data & Telemetry Store (Per-UID Real User Isolation)
 */

const fs = require('fs');
const path = require('path');

class UserStore {
  constructor() {
    this.users = new Map();
    this.initDefaultUser();
  }

  initDefaultUser() {
    const defaultUid = 'usr_alex_runner';
    this.users.set(defaultUid, {
      profile: {
        uid: defaultUid,
        displayName: 'Alex Runner',
        email: 'alex.runner@dokra.health',
        photoURL: '',
        createdAt: new Date().toISOString(),
        connectedApps: {
          runnerMobile: true,
          dokraWeb: true,
          lastSync: new Date().toISOString()
        }
      },
      telemetry: {
        dailySteps: 8450,
        stepGoal: 10000,
        distanceKm: 5.42,
        calorieBurn: 440,
        energyScore: 86,
        heartRate: 72,
        heartRateMin: 54,
        heartRateMax: 148,
        sleepHours: 7.7,
        sleepScore: 88,
        waterLiters: 2.4,
        waterGoal: 3.0,
        bloodOxygen: 98,
        bloodGlucose: 95,
        updatedAt: new Date().toISOString()
      },
      workouts: [
        {
          id: 'w_01',
          type: 'Outdoor Running',
          mode: 'RUN',
          distanceKm: 5.42,
          duration: '28:14',
          pace: '5:12 /km',
          bpm: 142,
          calories: 380,
          route: 'Central Park Loop Trail',
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  getUser(uid) {
    if (!this.users.has(uid)) {
      this.users.set(uid, {
        profile: {
          uid: uid,
          displayName: 'Dokra Athlete',
          email: `${uid}@dokra.health`,
          photoURL: '',
          createdAt: new Date().toISOString(),
          connectedApps: { runnerMobile: true, dokraWeb: true, lastSync: new Date().toISOString() }
        },
        telemetry: {
          dailySteps: 0,
          stepGoal: 10000,
          distanceKm: 0.0,
          calorieBurn: 0,
          energyScore: 80,
          heartRate: 70,
          heartRateMin: 55,
          heartRateMax: 140,
          sleepHours: 7.5,
          sleepScore: 85,
          waterLiters: 0.0,
          waterGoal: 3.0,
          bloodOxygen: 98,
          bloodGlucose: 95,
          updatedAt: new Date().toISOString()
        },
        workouts: []
      });
    }
    return this.users.get(uid);
  }

  getProfile(uid) {
    return this.getUser(uid).profile;
  }

  updateProfile(uid, updates) {
    const user = this.getUser(uid);
    user.profile = { ...user.profile, ...updates, updatedAt: new Date().toISOString() };
    return user.profile;
  }

  getTelemetry(uid) {
    return this.getUser(uid).telemetry;
  }

  updateTelemetry(uid, updates) {
    const user = this.getUser(uid);
    user.telemetry = { ...user.telemetry, ...updates, updatedAt: new Date().toISOString() };
    user.profile.connectedApps.lastSync = new Date().toISOString();
    return user.telemetry;
  }

  getWorkouts(uid) {
    return this.getUser(uid).workouts;
  }

  addWorkout(uid, workout) {
    const user = this.getUser(uid);
    const newWorkout = {
      id: 'w_' + Date.now(),
      ...workout,
      timestamp: new Date().toISOString()
    };
    user.workouts.unshift(newWorkout);
    // Automatically update cumulative telemetry
    if (workout.distanceKm) user.telemetry.distanceKm += parseFloat(workout.distanceKm);
    if (workout.calories) user.telemetry.calorieBurn += parseInt(workout.calories, 10);
    user.telemetry.updatedAt = new Date().toISOString();
    return newWorkout;
  }
}

module.exports = { UserStore };
