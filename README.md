# Emoter

A Library that will handle access to all Emote providers for Twitch.tv including Twitch themselves. It also includes parsing messages from twitch chat (and in general).

## Installation

```sh
yarn add @jimmyboy/emoter
```

## Usage

#### Main Class: Emoter

```ts
import { Emoter } from "@jimmyboy/emoter"

// Init w/ channel
const emoter = new Emoter("devjimmyboy")
```
