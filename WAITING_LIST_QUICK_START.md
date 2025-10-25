# Waiting List Quick Start Guide

## 🚀 **Quick Setup & Testing**

### **1. Start the Backend Server**
```bash
cd /Applications/MAMP/htdocs/ANTHONIO/AnthonyServer
php artisan serve --host=0.0.0.0 --port=8000
```

### **2. Start the Frontend Server**
```bash
cd /Applications/MAMP/htdocs/ANTHONIO/Lovable
yarn dev --host 0.0.0.0 --port=8080
```

### **3. Test the System**

#### **A. Visit Coming Soon Page**
- Open: `http://localhost:8080/`
- Enter an email address
- See success message
- Check for welcome email (if mail is configured)

#### **B. Test API Directly**
```bash
# Subscribe to waiting list
curl -X POST http://localhost:8000/api/waitinglist/subscribe \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "source": "coming_soon"
  }'
```

#### **C. Check Database**
```bash
cd /Applications/MAMP/htdocs/ANTHONIO/AnthonyServer
php artisan tinker
```
```php
// In tinker
App\Models\WaitingList::all();
App\Models\WaitingList::count();
```

#### **D. Access Admin Dashboard**
- Open: `http://localhost:8080/admin/waitlist`
- View subscriber statistics
- Export CSV data
- Manage subscribers

### **4. API Endpoints for Testing**

#### **Subscribe to Waiting List**
```http
POST /api/waitinglist/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "coming_soon"
}
```

#### **Get Statistics (Admin)**
```http
GET /api/waitinglist/stats
Authorization: Bearer YOUR_TOKEN
```

#### **Unsubscribe**
```http
POST /api/waitinglist/unsubscribe
Content-Type: application/json

{
  "token": "UNSUBSCRIBE_TOKEN"
}
```

### **5. Expected Responses**

#### **Successful Subscription**
```json
{
  "success": true,
  "message": "Successfully subscribed to the waiting list!",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "subscribed_at": "2025-10-22T10:20:48.000000Z"
  }
}
```

#### **Duplicate Email**
```json
{
  "success": false,
  "message": "This email address is already subscribed to our waiting list.",
  "data": {
    "email": "user@example.com"
  }
}
```

#### **Statistics Response**
```json
{
  "success": true,
  "data": {
    "total_subscribers": 10,
    "active_subscribers": 8,
    "unsubscribed": 2,
    "bounced": 0,
    "verified_emails": 5,
    "recent_subscribers": {
      "today": 3,
      "week": 7,
      "month": 10
    },
    "by_source": {
      "coming_soon": 8,
      "social_media": 2
    }
  }
}
```

### **6. Database Tables**

#### **waiting_list table structure:**
- `id` - Primary key
- `email` - Unique email address
- `name` - Optional subscriber name
- `phone` - Optional phone number
- `source` - Subscription source (coming_soon, newsletter, etc.)
- `status` - active, unsubscribed, bounced
- `subscribed_at` - Subscription timestamp
- `unsubscribe_token` - Unique unsubscribe token
- `metadata` - JSON field for additional data
- `email_verified` - Boolean verification status
- `ip_address` - Subscriber's IP address
- `user_agent` - Browser/device information

### **7. Mail Templates**

Two email templates are automatically created:
1. **"Waiting List Welcome Email"** - Sent to new subscribers
2. **"Launch Notification Email"** - For when you're ready to launch

### **8. Frontend Components**

#### **Coming Soon Page Features:**
- Video background with fallback
- Email subscription form
- Real-time validation
- Success/error toasts
- Mobile responsive design

#### **Admin Dashboard Features:**
- Subscriber list with pagination
- Search and filtering
- Real-time statistics
- CSV export
- Status management
- Growth analytics

### **9. Security Features**

- Rate limiting on subscription endpoint
- CSRF protection
- Input validation and sanitization
- Unique unsubscribe tokens
- IP address logging
- SQL injection prevention

### **10. Troubleshooting**

#### **Common Issues:**

**API not responding:**
- Check if Laravel server is running on port 8000
- Verify database connection
- Check Laravel logs: `tail -f storage/logs/laravel.log`

**Frontend not loading:**
- Check if Yarn dev server is running on port 8080
- Verify all dependencies are installed: `yarn install`
- Check browser console for errors

**Email not sending:**
- Configure mail settings in `.env`
- Check mail queue: `php artisan queue:work`
- Verify mail templates exist in database

**Database errors:**
- Run migrations: `php artisan migrate`
- Seed email templates: `php artisan db:seed --class=WaitingListMailTemplateSeeder`
- Check database connection in `.env`

### **11. Production Deployment**

#### **Backend:**
1. Set `APP_ENV=production` in `.env`
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Run `php artisan migrate --force`
5. Set up proper mail configuration
6. Configure queue workers

#### **Frontend:**
1. Run `yarn build`
2. Deploy `dist` folder to web server
3. Configure API endpoint URL
4. Set up analytics tracking

---

**Your waiting list system is now ready to capture leads and build your launch audience!** 🎯