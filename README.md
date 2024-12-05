# Home Assistent Clients in C-Sharp

--------------------------

## **!! Work in progress !!**

--------------------------

## Intro

This repo is an attempt to create .NET Clients for [Home Assistant](https://www.home-assistant.io/).  This is the start of a bigger project to turn my [Easywave2MQTT](https://github.com/marcselis/Easywave2MQTT) plugin in a native .NET Home Assistant plug-in that works without MQTT.

At its current state the solution has 2 independant projects: a client for Home Assistant's [REST API](https://developers.home-assistant.io/docs/api/rest/) and another one for its [WebSocket API](https://developers.home-assistant.io/docs/api/websocket).  Both are incomplete and only cover the pure basics: connecting, authorization and at least 1 other call, but that is enough to get a grasp on how things work and how to build things further from here.

## Trying things out

Before trying things out, create your own Long-Lived Access Token in the bottom of the Security tab of your Home Assistant Profile and copy that over to the `AuthorizationToken` setting in the `appsettings.json` files in both projects, and change the `HomeAssistantUri` setting to point to your Home Assistant instance.
