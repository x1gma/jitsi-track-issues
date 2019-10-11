import { Subject } from 'rxjs';

export class Participant {
    id: string;
    name: string;
}

export class TrackChangedEvent {
    constructor(public participantId: string, public oldTrack: any, public newTrack: any) { }
}

export class ConferenceState {

    public audioChanged = new Subject<TrackChangedEvent>();

    public videoChanged = new Subject<TrackChangedEvent>();

    public connection: any;

    public conference: any;

    public participants: Participant[] = [];

    public participantAudio: Map<string, any> = new Map();

    public participantVideo: Map<string, any> = new Map();

    public conferenceJoined = false;

    public getParticipant(id: string): Participant {
        return this.participants.find(participant => participant.id === id);
    }

    public newParticipant(id: string): Participant {
        let participant = this.getParticipant(id);
        if (participant) {
            console.log(`Ignoring user join event because user is already joined: ${id}`, participant);
            return participant;
        }
        participant = new Participant();
        participant.id = id;
        this.participants.push(participant);
        return participant;
    }

    public removeParticipant(id: string): void {
        const participant = this.getParticipant(id);
        if (!this.getParticipant(id)) {
            console.log(`Ignoring user leave event because user is not joined: ${id}`, participant);
            return;
        }

        const index = this.participants.findIndex(p => p.id === id);
        this.participants.splice(index, 1);
        this.participantAudio.delete(id);
        this.participantVideo.delete(id);
    }

    public newTrack(track: any): void {
        if (track.isLocal()) {
            console.log(`Ignoring added local track from remote.`, track);
            return;
        }

        const participantId = track.getParticipantId();
        if (!this.getParticipant(participantId)) {
            console.warn(`Received remote track for unknown participant ${participantId}`, track);
        }

        switch (track.getType()) {
            case 'audio':
                this.setTrack(participantId, track, this.participantAudio, this.audioChanged);
                break;
            case 'video':
                this.setTrack(participantId, track, this.participantVideo, this.videoChanged);
                break;
            default:
                console.log(`Dropping unknown track with type ${track.getType()}`, track);
                break;
        }
    }

    public removeTrack(track: any): void {
        if (track.isLocal()) {
            return;
        }

        const participantId = track.getParticipantId();
        if (!this.getParticipant(participantId)) {
            console.warn(`Attempted to remove remote track for unknown participant ${participantId}`, track);
        }

        switch (track.getType()) {
            case 'audio':
                this.setTrack(participantId, null, this.participantAudio, this.audioChanged);
                break;
            case 'video':
                this.setTrack(participantId, null, this.participantVideo, this.videoChanged);
                break;
            default:
                console.log(`Dropping unknown track with type ${track.getType()}`, track);
                break;
        }
    }

    private setTrack(participantId: any, track: any, tracks: Map<string, any>, notifier: Subject<TrackChangedEvent>): void {
        console.log(`Received new track ${track ? track.getType() : 'null'} for participant ${participantId})`, track);

        const oldTrack = tracks.get(participantId);
        if (oldTrack) {
            console.log(`Old track ${track ? track.getType() : 'null'} present for participant (${participantId})`, oldTrack);
        }
        tracks.set(participantId, track);

        const oldTrackId = oldTrack ? oldTrack.getId() : null;
        const newTrackId = track ? track.getId() : null;
        if (oldTrackId !== newTrackId) {
            notifier.next(new TrackChangedEvent(participantId, oldTrack, track));
        }
    }

}