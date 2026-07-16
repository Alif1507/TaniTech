import unittest
from fastapi.testclient import TestClient
from main import app
from datetime import date

class TestTaniTechBackend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        """
        Tests the root endpoint returns healthy status and metadata.
        """
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["app"], "TaniTech Backend API")
        self.assertEqual(data["status"], "healthy")

    def test_articles_endpoint(self):
        """
        Tests that we can retrieve articles and that filters work.
        """
        # Test general listing
        response = self.client.get("/api/articles")
        self.assertEqual(response.status_code, 200)
        articles = response.json()
        self.assertTrue(len(articles) > 0)
        self.assertEqual(articles[0]["title"], "Rotasi Tanaman untuk Menjaga Nutrisi Tanah")
        
        # Test filter by category
        response_filtered = self.client.get("/api/articles?category=sustainability")
        self.assertEqual(response_filtered.status_code, 200)
        filtered = response_filtered.json()
        self.assertTrue(len(filtered) > 0)
        for art in filtered:
            self.assertEqual(art["category"], "sustainability")

    def test_faqs_endpoint(self):
        """
        Tests that FAQs are successfully listed.
        """
        response = self.client.get("/api/faqs")
        self.assertEqual(response.status_code, 200)
        faqs = response.json()
        self.assertTrue(len(faqs) > 0)
        self.assertIn("TaniTech", faqs[0]["question"] or faqs[0]["answer"])

    def test_categories_endpoint(self):
        """
        Tests categories list retrieval.
        """
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        categories = response.json()
        self.assertTrue(len(categories) > 0)
        # Check first category is Beras & Biji-bijian (our seeded value)
        names = [c["name"] for c in categories]
        self.assertIn("Beras & Biji-bijian", names)

    def test_weather_current_endpoint(self):
        """
        Tests the real-time weather query using coordinates.
        """
        response = self.client.get("/api/weather/current?lat=-7.2278&lng=107.9086")
        self.assertEqual(response.status_code, 200)
        weather = response.json()
        self.assertIn("temperature", weather)
        self.assertIn("precipitation_sum_mm", weather)
        self.assertIn("summary_text", weather)

if __name__ == "__main__":
    unittest.main()
