from mangum import Mangum
from app import app

# This is the handler function that AWS Lambda will call
handler = Mangum(app)
