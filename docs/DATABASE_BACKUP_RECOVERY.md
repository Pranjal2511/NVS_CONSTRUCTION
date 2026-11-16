# Current backup and recovery procedure — 2026-11-16

This update supersedes historical recovery claims below. No usable BSON dump, archive or customer export was found in workspace inventory. Repository seed JSON is starter content, not a backup. Actual nvs_buildcon connection/ping succeeded and collection inventory was empty. No historical data has been recovered and no initializer was executed.

## Check surviving copies first

In the confirmed Atlas project, inspect backup snapshots/continuous-backup history and retention around the deletion time. Confirm project, cluster and database identity; a saved Compass connection is not proof of identity. Check independently maintained server dumps, restricted cloud backup locations and exports held by the operator. Availability of Atlas recovery is account/plan/time dependent and was not verified here.

If a surviving snapshot exists, restore to a separate empty recovery target first. Compare collection names, counts, indexes and sampled records under authorized access. Do not copy customer records into automated tests. Seed content cannot reconstruct missing users, enquiries or appointments.

## Explicit backup/restore commands (not executed)

Use current MongoDB Database Tools. Put the source URI/password in a restricted YAML configuration file outside the repository, not a command argument. Ensure the configured authentication database is correct. The operator must select source, output path and a new target explicitly.

Example backup of the selected development database, after approval:

    mongodump --config "C:\private\nvs-source.yml" --db nvs_buildcon --archive="C:\private\backups\nvs_buildcon-2026-11-16.archive" --gzip

Example restore into a separately verified empty target, using a restricted target configuration:

    mongorestore --config "C:\private\nvs-recovery.yml" --archive="C:\private\backups\nvs_buildcon-2026-11-16.archive" --gzip --nsFrom="nvs_buildcon.*" --nsTo="nvs_recovery_test.*" --stopOnError

These examples are manual operator steps, not runnable automation. Confirm the target is empty and different from live production. Do not add --drop; do not overwrite an existing database. Database Tools were not installed or these commands tested during repair. Check compatible server/tool versions and config support before use. [MongoDB dump documentation](https://www.mongodb.com/docs/database-tools/mongodump/) and [backup/restore guidance](https://www.mongodb.com/docs/manual/tutorial/backup-and-restore-tools/) describe the supported options.

## Initialization is separate

Review CURRENT_PROJECT_STATUS.md for the exact seed dry-run/apply and separate administrator commands. Starter data verifies as 8 projects, 17 gallery items, 10 house plans and 4 testimonials from seedData.json; 3 services, 2 blogs and settings come from existing seed.js defaults. Missing records only are inserted; no historical customer data is fabricated.

Dedicated test environments should use names matching nvs_*_test and isolated credentials with no access to production. Automated suites here use mocks and do not require a real test database.

## Retention and operations

Agree on recovery-point/recovery-time needs with the owner. A proposed starting policy is daily encrypted backups, weekly retention review and a monthly restore rehearsal to a new target; the owner must approve retention periods and deletion rules. Keep at least one backup outside the application's storage account, restrict permissions, monitor failed backup jobs and verify restore integrity. No backup job or automatic deletion schedule was created.

---
## Historical recovery notes retained below

# Database Backup & Recovery Guide
## NVS Buildcon & Architects Platform

**Date:** October 2026  
**Database:** MongoDB Atlas / Mongoose  
**Application database name:** `nvs_buildcon` (default; overridden by `MONGODB_URI`)

---

## 1. Purpose

This document describes how to back up, inspect, and restore the MongoDB database for the NVS Buildcon application. It is intended for operators who need to recover from data loss (for example, an accidentally deleted database) or to perform routine production backups.

---

## 2. Select the Correct MongoDB Atlas Project and Cluster

Before any backup or restore operation, confirm you are operating against the correct Atlas project and cluster used by this application:

1. Log in to MongoDB Atlas (https://cloud.mongodb.com).
2. Select the project that contains the NVS Buildcon cluster.
3. Confirm the cluster name matches the one referenced in `MONGODB_URI` in your environment configuration.
4. Confirm the database name. The application defaults to `nvs_buildcon`; the actual name is determined by the `MONGODB_URI` connection string (the path after the final `/`).
5. Never print or share the full `MONGODB_URI` (it contains credentials). Mask credentials when logging: `mongodb+srv://user:****@cluster.mongodb.net/database`.

---

## 3. Inspect Atlas Backup Availability

MongoDB Atlas offers continuous cloud backups and snapshots depending on your cluster tier:

1. In Atlas, navigate to **Clusters** → select the NVS Buildcon cluster → **Backups**.
2. Review the backup status:
   - **Continuous Cloud Backup:** shows the latest recoverable point-in-time and retention window.
   - **Snapshots:** lists available manual/automated snapshots with timestamps.
3. Confirm at least one snapshot or continuous backup exists within your required recovery window.
4. If no backups are listed, continuous backup may not be enabled for this cluster. Enable it before relying on Atlas for recovery.

Do not trigger a restore without first confirming the target cluster and understanding that a restore overwrites data on the target database.

---

## 4. Verify the Application Database Name (Without Exposing Credentials)

To confirm which database the application uses without revealing connection credentials:

1. Inspect `server/config/env.js` — the default database name is `nvs_buildcon` unless `MONGODB_URI` overrides it.
2. Inspect your deployment environment's `MONGODB_URI` value (mask the credentials). The database name is the path segment after the final `/` in the URI.
3. Do not print the full URI, username, or password to terminal output, logs, or reports.

---

## 5. Create a Database Backup

### Option A: Atlas Continuous Backup / Snapshot (Recommended for Atlas)

1. In Atlas, go to **Clusters** → the NVS Buildcon cluster → **Backups**.
2. Click **Create Snapshot** (manual on-demand snapshot) if you need an immediate backup before a change.
3. Wait for the snapshot to complete and record the snapshot ID and timestamp.
4. Retain the snapshot for the duration required by your retention policy.

### Option B: `mongodump` (Local or Network-Accessible Cluster)

If you have network access to the cluster and the `mongodump` tool installed:

```bash
# Mask the URI in any output/logs. Do not print the full URI.
mongodump --uri="<MONGODB_URI>" --db=nvs_buildcon --out=./backups/$(date +%Y%m%d-%H%M%S)
```

- Replace `<MONGODB_URI>` with your connection string (credentials masked in logs).
- Replace `nvs_buildcon` with the actual database name if different.
- The output directory contains BSON/JSON dump files per collection.

Do not store backup files containing credentials or sensitive customer data in unsecured locations.

---

## 6. Restore a Backup to a Separate Target Database

**Never restore directly over the production database without explicit, separate authorization.**

To restore safely:

1. Identify a separate target database (e.g., `nvs_buildcon_recovery_<date>`) so you do not overwrite live data.
2. Confirm the target database name and cluster before writing.
3. Restore using Atlas **Restore** (from snapshot/continuous backup) pointing to the separate target database, or `mongorestore`:

```bash
mongorestore --uri="<TARGET_MONGODB_URI>" --db=nvs_buildcon_recovery ./backups/<snapshot-dir>/nvs_buildcon
```

4. Verify restored collections and record counts before switching the application to use the restored database.
5. Only update `MONGODB_URI` to point to the recovered database after validation and owner approval.

---

## 7. Verify Restored Collections and Record Counts

After a restore, confirm the data is intact:

1. Connect to the target database (read-only where possible).
2. List collections: `db.getCollectionNames()`.
3. Count documents per collection:
   ```js
   db.users.countDocuments()
   db.projects.countDocuments()
   db.enquiries.countDocuments()
   db.appointments.countDocuments()
   db.houseplans.countDocuments()
   db.blogs.countDocuments()
   db.gallery.countDocuments()
   db.services.countDocuments()
   db.testimonials.countDocuments()
   db.sitesettings.countDocuments()
   ```
4. Compare counts against expected values from before the incident.
5. Spot-check a few documents from each collection to confirm structure and content are intact.

---

## 8. Maintain a Recovery Process for Production Incidents

1. **Schedule regular backups:** Enable Atlas Continuous Cloud Backup with an appropriate retention window (e.g., 7–30 days).
2. **Test restores periodically:** Perform a restore to a separate target database and verify record counts at least quarterly.
3. **Document the runbook:** Keep this guide updated with the actual cluster name, database name, and restore procedure.
4. **Secure backup credentials:** Store `MONGODB_URI` and any Atlas API keys in a secrets manager, not in source code.
5. **Alert on backup failure:** Configure Atlas alerts so backup failures are noticed immediately.

---

## 9. Keep Backup Credentials Secure

- Never commit `.env` or any file containing `MONGODB_URI`, `JWT_SECRET`, or SMTP credentials to version control.
- `.env` is gitignored in this project; `.env.example` contains placeholders only.
- Use environment variables or a secrets manager for production.
- Rotate database credentials and JWT secrets after any suspected exposure.

---

## 10. Avoid Restoring Over the Wrong Database

Before any restore:

1. Confirm the target cluster and database name in writing.
2. Use a separate target database name for validation first.
3. Never run `mongorestore` or Atlas Restore against the live production database unless explicitly authorized and after verifying the backup contents.
4. Do not automate restores without a manual confirmation step.

---

## 11. Current Recovery Status for This Incident

The application database was deleted through MongoDB Compass. An inspection of the repository found:

- **No database dump files:** No `.dump`, `.bson`, `.archive`, `.gz`, `.zip`, or backup files exist in the repository.
- **No previous exports:** No MongoDB export JSON files or archived project backups were found.
- **Seed data only:** `server/data/seedData.json` contains approved seed content (projects, house plans, gallery, services, testimonials, blogs). This is **not** a backup of customer or production data.
- **No known backup:** No usable recovery source was found in the repository.

**Outcome:** Original historical records (enquiries, appointments, users, uploaded files, etc.) cannot be recovered from repository contents. Recreating collections restores structure and approved seed content only — it does **not** restore deleted historical records.

See `server/utils/seed.js` for the seed structure and `docs/REPAIR_PLAN.md` for the safe reconstruction workflow.
