const url = process.env.ARHC_HEALTH_URL || `http://127.0.0.1:${process.env.PORT || 3000}/api/health`;

try {
  const response = await fetch(url, { method: "GET" });
  if (response.status !== 200) {
    throw new Error(`Expected 200 from ${url}, received ${response.status}`);
  }

  const body = await response.json();
  if (!body.ok) {
    throw new Error(`Health endpoint returned 200 but ok was not true for ${url}`);
  }

  console.log(`ARHC health check passed: 200 ${url}`);
} catch (error) {
  console.error(`ARHC health check failed: ${error.message}`);
  process.exitCode = 1;
}
