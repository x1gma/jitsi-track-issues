import { Injectable } from '@angular/core';

declare let JitsiMeetJS: any;

@Injectable({
  providedIn: 'root'
})
export class JitsiService {

  private options: any = {
    // useIPv6: false,
    desktopSharingChromeExtId: 'mbocklcggfhnbahlnepmldehdhpjfcjp',
    desktopSharingChromeDisabled: false,
    desktopSharingChromeSources: ['screen', 'window', 'tab'],
    desktopSharingChromeMinExtVersion: '0.1',
    desktopSharingFirefoxDisabled: false,
    disableAudioLevels: false,
    disableSimulcast: false,
    enableWindowOnErrorHandler: true,
    disableThirdPartyRequests: true,
    enableAnalyticsLogging: false,
    disableRtx: false,
    disableH264: false,
    preferH264: false,

    useRtcpMux: true,
    useBundle: true,
    disableSuspendVideo: true,

    bosh: 'https://beta.meet.jit.si/http-bind',
    hosts: {
      domain: 'beta.meet.jit.si',
      muc: 'conference.beta.meet.jit.si'
    },
    p2p: {
      enabled: true,
      stunServers: [
        {
          urls: 'stun:sprintly-video-stunturnice.vitaphone.com:3478'
        }
      ]
    },
    useStunTurn: true,
    enableLipSync: false,

    openBridgeChannel: true,
    enableTalkWhileMuted: false,
    ignoreStartMuted: false,
    startSilent: false
  };

  private jitsiTrackOptions = {
    devices: ['video', 'audio']
  };

  constructor() {
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.DEBUG);
    JitsiMeetJS.init(this.options);
  }

  public createConnection(callbacks: ConnectionEventHandler): any {
    console.log('Creating connection');
    const connection = new JitsiMeetJS.JitsiConnection(null, null, this.options);
    this.bindLog(connection,
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      JitsiMeetJS.events.connection.WRONG_STATE);

    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED,
      (errorType: any, message: any, credentials: any, details: any) => callbacks.onConnectionFailure(errorType, message, credentials, details));
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      (id: any) => callbacks.onConnectionSuccess(id));
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      (message: any) => callbacks.onConnectionDisconnect(message));
    connection.addEventListener(JitsiMeetJS.events.connection.WRONG_STATE,
      () => callbacks.onConnectionWrongState());

    connection.connect();

    return connection;
  }

  public createConference(connection: any, callbacks: ConferenceEventHandler): any {
    const conference = connection.initJitsiConference('b5054d45b0594037b5a58ba48065d4dg', this.options);

    this.bindLog(conference,
      JitsiMeetJS.events.conference.TRACK_ADDED,
      JitsiMeetJS.events.conference.TRACK_REMOVED,
      JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED,
      // JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED,
      JitsiMeetJS.events.conference.USER_JOINED,
      JitsiMeetJS.events.conference.USER_LEFT,
      JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
      JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
      JitsiMeetJS.events.conference.SUBJECT_CHANGED,
      JitsiMeetJS.events.conference.LAST_N_ENDPOINTS_CHANGED,
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      JitsiMeetJS.events.conference.CONFERENCE_LEFT,
      JitsiMeetJS.events.conference.DTMF_SUPPORT_CHANGED,
      JitsiMeetJS.events.conference.USER_ROLE_CHANGED,
      JitsiMeetJS.events.conference.USER_STATUS_CHANGED,
      JitsiMeetJS.events.conference.CONFERENCE_FAILED,
      JitsiMeetJS.events.conference.CONFERENCE_ERROR,
      JitsiMeetJS.events.conference.KICKED,
      JitsiMeetJS.events.conference.START_MUTED_POLICY_CHANGED,
      JitsiMeetJS.events.conference.STARTED_MUTED,
      JitsiMeetJS.events.conference.CONNECTION_STATS,
      JitsiMeetJS.events.conference.BEFORE_STATISTICS_DISPOSED,
      JitsiMeetJS.events.conference.AUTH_STATUS_CHANGED,
      // JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED
    );

    conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_LEFT,
      () => callbacks.onConferenceLeave());
    conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      () => callbacks.onConferenceJoin());
    conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_FAILED,
      () => callbacks.onConferenceFailure());
    conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_ERROR,
      () => callbacks.onConferenceError());

    conference.addEventListener(JitsiMeetJS.events.conference.TRACK_ADDED,
      (track: any) => callbacks.onTrackAdded(track));
    conference.addEventListener(JitsiMeetJS.events.conference.TRACK_REMOVED,
      (track: any) => callbacks.onTrackRemoved(track));

    conference.addEventListener(JitsiMeetJS.events.conference.USER_JOINED,
      (id: any, participant: any) => callbacks.onUserJoin(id, participant));
    conference.addEventListener(JitsiMeetJS.events.conference.USER_LEFT,
      (id: any, participant: any) => callbacks.onUserLeave(id, participant));

    conference.join();

    return conference;
  }

  public createLocalTracks(): Promise<any> {
    return JitsiMeetJS.createLocalTracks(this.jitsiTrackOptions);
  }

  private bindLog(object: any, ...eventTypes: string[]) {
    eventTypes.forEach(eventType => {
      object.addEventListener(eventType, (args: any[]) => console.log(`JitsiService: Event ${eventType} params: `, args));
    });
  }

}

export interface ConnectionEventHandler {
  onConnectionFailure: (errorType: any, message: any, credentials: any, details: any) => any;
  onConnectionSuccess: (id: any) => any;
  onConnectionDisconnect: (message: any) => any;
  onConnectionWrongState: () => any;
}

export interface ConferenceEventHandler {
  onConferenceLeave: () => any;
  onConferenceJoin: () => any;
  onConferenceFailure: () => any;
  onConferenceError: () => any;
  onTrackAdded: (track: any) => any;
  onTrackRemoved: (track: any) => any;
  onUserJoin: (id: any, participant: any) => any;
  onUserLeave: (id: any, participant: any) => any;
}
