import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, AfterViewInit } from '@angular/core';
import { ConferenceState, Participant } from 'src/app/services/jitsi.state';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
})
export class ParticipantComponent implements AfterViewInit {

  @Input() participant: Participant;
  @Input() conferenceState: ConferenceState;

  @ViewChild('video') videoNode: ElementRef;
  @ViewChild('audio') audioNode: ElementRef;

  constructor() { }

  ngAfterViewInit() {
    this.conferenceState.audioChanged.subscribe(event => {
      this.attachTrack(this.audioNode, event.oldTrack, event.newTrack);
    });
    this.conferenceState.videoChanged.subscribe(event => {
      this.attachTrack(this.videoNode, event.oldTrack, event.newTrack);
    });

    this.attachTrack(this.videoNode, null, this.conferenceState.participantVideo.get(this.participant.id));
    this.attachTrack(this.audioNode, null, this.conferenceState.participantAudio.get(this.participant.id));
  }

  public hasVideo(): boolean {
    return this.conferenceState.participantVideo.get(this.participant.id);
  }

  private attachTrack(element: ElementRef, oldTrack: any, newTrack: any) {
    if (oldTrack) {
      oldTrack.detach(element.nativeElement);
    }
    if (newTrack) {
      newTrack.attach(element.nativeElement);
    }
  }
}
