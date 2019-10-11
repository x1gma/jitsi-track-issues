# jitsi-track-issues

Test application demonstrating the issues described in https://community.jitsi.org/t/video-tracks-not-being-received-send/20177

Environment: The configuration uses the default Google STUN servers and the beta.meet.jit.si API. The conference room name is hardcoded in the jitsi.service.ts.

## Steps to reproduce

Used browser: Firefox 68.1.0esr 64bit

When at least two users are present in the conference, and one of the users disconnects and reconnects again, 
then the stream will occasionally be frozen after a few seconds, or completely blank.

When the other user which has not disconnected before disconnects and reconnects, 
the other user will not receive a video track at all.

Both issues may appear only after disconnecting and reconnecting multiple times.

## Local environment

```
> ionic info

Ionic:

   ionic (Ionic CLI)             : 4.12.0 ([...]\v10.14.1\node_modules\ionic)
   Ionic Framework               : @ionic/angular 4.1.3
   @angular-devkit/build-angular : 0.13.9
   @angular-devkit/schematics    : 7.3.9
   @angular/cli                  : 7.3.9
   @ionic/angular-toolkit        : 1.5.1

System:

   NodeJS : v10.14.1 (C:\Program Files\nodejs\node.exe)
   npm    : 6.4.1
   OS     : Windows 10
```
