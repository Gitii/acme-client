#!/usr/bin/env sh

/app/packages/acme-client-bot/bin/run.sh \
  --maintainer-email="$MAINTAINER_EMAIL" \
  --storage-bucket-name="$STORAGE_BUCKET_NAME" \
  --storage-region-name="$STORAGE_REGION_NAME" \
  --storage-region-name="$STORAGE_REGION_NAME" \
  --access-key-file="$ACCESS_KEY_FILE" \
  --challenge-token-file="$CHALLENGE_TOKEN_FILE" \
  --secret-key-file="$SECRET_KEY_FILE" \
  --storage-endpoint="$STORAGE_ENDPOINT" \
  --storage-path="$STORAGE_PATH" \
  --certificate-from-env

