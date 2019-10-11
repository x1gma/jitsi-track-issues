import { Component, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { JitsiService, ConnectionEventHandler, ConferenceEventHandler } from '../services/jitsi.service';
import { ConferenceState } from '../services/jitsi.state';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit, OnDestroy, ConnectionEventHandler, ConferenceEventHandler {

  @ViewChild('localVideo') localVideoNode: ElementRef;

  public conferenceState: ConferenceState;

  public localTracks: any[];

  private disconnecting = false;

  constructor(private jitsi: JitsiService) { }

  ngAfterViewInit() {
    this.jitsi.createLocalTracks()
      .then((tracks: any[]) => {
        tracks.find(track => track.getType() === 'video').attach(this.localVideoNode.nativeElement);
        this.localTracks = tracks;
      })
      .catch(error => console.error(error));
  }

  public connect() {
    this.conferenceState = new ConferenceState();
    this.conferenceState.connection = this.jitsi.createConnection(this as ConnectionEventHandler);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    this.disconnect();
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    this.disconnect();
  }

  public disconnect() {
    if (this.disconnecting) {
      return;
    }
    this.disconnecting = true;

    console.log('disconnect');
    this.conferenceState.conference.getLocalTracks()
      .forEach(track => this.conferenceState.conference.removeTrack(track));
    // .forEach(track => track.dispose());
    return this.conferenceState.conference.leave()
      .then(() => this.conferenceState.connection.disconnect())
      .catch(error => console.error(error));
  }

  onConnectionSuccess(id: any): any {
    this.conferenceState.conference = this.jitsi.createConference(this.conferenceState.connection, this as ConferenceEventHandler);
  }

  onConferenceJoin(): any {
    this.conferenceState.conferenceJoined = true;
    this.localTracks.forEach(track => {
      this.conferenceState.conference.addTrack(track);
    });
  }

  onUserJoin(id: any, participant: any): any {
    const metadata = this.conferenceState.newParticipant(id);
    metadata.name = participant.getDisplayName();
  }

  onTrackAdded(track: any): any {
    this.conferenceState.newTrack(track);
  }

  onConferenceLeave(): any {
    this.conferenceState.conference = null;
    this.conferenceState.participantAudio.clear();
    this.conferenceState.participantVideo.clear();
    this.conferenceState.participants = [];
    this.disconnecting = false;
  }

  onTrackRemoved(track: any): any {
    this.conferenceState.removeTrack(track);
  }

  onUserLeave(id: any, participant: any): any {
    this.conferenceState.removeParticipant(id);
  }

  onConnectionFailure(errorType: any, message: any, credentials: any, details: any): any {

  }

  onConnectionDisconnect(message: any): any {
  }

  onConnectionWrongState(): any {
  }


  onConferenceFailure(): any {

  }
  onConferenceError(): any {

  }


}

