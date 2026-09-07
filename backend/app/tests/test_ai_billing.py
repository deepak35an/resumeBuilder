def test_ai_rewrite_rule_based(client, auth_headers):
    response = client.post(
        "/api/ai/rewrite",
        headers=auth_headers,
        json={"text": "Responsible for website development", "action": "improve"},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["suggestion"]
    assert "review" in body["notice"].lower()
    assert "website" in body["suggestion"].lower() or "developed" in body["suggestion"].lower()


def test_pricing_and_noop_checkout(client, auth_headers):
    pricing = client.get("/api/subscriptions/pricing")
    assert pricing.status_code == 200
    keys = {item["key"] for item in pricing.json()}
    assert keys == {"free", "pro"}

    checkout = client.post(
        "/api/subscriptions/checkout",
        headers=auth_headers,
        json={"plan": "pro", "interval": "monthly"},
    )
    assert checkout.status_code == 200, checkout.text
    assert checkout.json()["provider"] == "noop"

    me = client.get("/api/users/me", headers=auth_headers)
    assert me.json()["plan"] == "pro"


def test_templates_list(client):
    response = client.get("/api/templates")
    assert response.status_code == 200
    slugs = {item["slug"] for item in response.json()}
    assert "classic-ats" in slugs
    assert len(slugs) >= 30


def test_examples_and_blog_empty_ok(client):
    examples = client.get("/api/content/examples")
    assert examples.status_code == 200
    assert any(item["slug"] == "software-engineer" for item in examples.json())
    blog = client.get("/api/content/blog")
    assert blog.status_code == 200


def test_dashboard_requires_auth(client, auth_headers):
    assert client.get("/api/dashboard").status_code == 401
    response = client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200, response.text
    assert "nextBestAction" in response.json()
