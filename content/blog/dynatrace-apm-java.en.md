---
title: Setting Up Dynatrace APM for Java Microservices
date: 2024-11-15
---

The easiest way to monitor Java microservices is to let Dynatrace's OneAgent discover them automatically. Once the agent is installed, services, call chains, and JVM metrics show up without changing any code. This post covers the full setup, from installation to alerting.

## Installing OneAgent

Dynatrace comes in two flavors: SaaS and Managed. Self-hosted environments usually use Managed; in the cloud, SaaS works directly. After getting access to an environment, deploy OneAgent from the Dynatrace UI and run the installation command it gives you on the host.

Java applications need no startup parameter changes — OneAgent automatically detects JVM processes and injects its probes. After a few minutes, the host and its Java processes appear in the UI. If they don't, check three things:

- Network connectivity between the host and the Dynatrace environment, and whether port 443 is open.
- Whether the OneAgent service is running: `systemctl status oneagent`.
- Whether the Java version is supported by OneAgent — very old JVMs need manual confirmation.

## What auto-discovery shows you

Once OneAgent is up, Dynatrace automatically draws the service topology:

- **Services**: every Java microservice, database, and message queue is detected, with call relationships connected automatically.
- **PurePaths**: the full call chain of each request, from entry point to database query, expandable to see exactly which step is slow.
- **JVM metrics**: heap usage, GC count and duration, thread count, and loaded classes — no separate JMX configuration needed.

All of this works out of the box with no configuration. To investigate a slow endpoint, open the service and look at the response-time distribution and the slowest PurePaths.

## Custom dashboards

The default views are fine, but every team cares about different things, so it's worth building a dashboard of your own. Common panels:

- **Key service response times**: P50, P90, and P99 on one chart, so a regression after a release is visible at a glance.
- **Error rate**: grouped by service, highlighted in red above 1%.
- **JVM health**: heap usage, GC duration, and thread-pool queueing.
- **Infrastructure**: CPU, memory, and disk IO — to rule out the machine first when something goes wrong.

Keep dashboards separated by environment — production and staging on different boards — so you never read the wrong one.

## SLA alerting

The point of monitoring is to know immediately when something breaks, not to dig through logs afterwards. At minimum, set up these alerts:

- **Availability**: error rate above 5% within 5 minutes.
- **Response time**: P90 above twice the usual baseline for 5 minutes.
- **JVM**: heap usage above 85%, or frequent Full GC.
- **Host**: CPU above 90% sustained, or disk free space below 10%.

Dynatrace alerts learn baselines from the past few weeks of data, so they can tell what "normal" looks like and reduce false alarms. Start with the default thresholds, run them for two weeks, then tighten based on false positives.

## Common pitfalls

- **Sampling rate**: on high-traffic services, default sampling may drop some slow requests. Raise sampling for critical endpoints.
- **Custom metrics**: business metrics like order volume or payment success rate are invisible to OneAgent — instrument them yourself via API or SDK.
- **Upgrades**: OneAgent upgrades itself automatically. Before a major upgrade, verify in staging that the probes still work with your JVM version.
- **Permissions**: OneAgent needs root or equivalent privileges to install. In containers, confirm the image leaves room for installation.

Once set up, the daily troubleshooting flow becomes: get an alert → check the dashboard to find the service → open the PurePath to see which step is slow → look at code or configuration. Most issues can be traced to a root cause inside Dynatrace, without digging through logs everywhere.
