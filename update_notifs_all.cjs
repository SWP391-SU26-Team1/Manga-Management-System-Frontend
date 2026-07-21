const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'pages', 'tantou-editor', 'TantouDashboardPage.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize CRLF to LF
content = content.replace(/\r\n/g, '\n');

// 1. Update fetchDashboard
const startIdx = content.indexOf('  const fetchDashboard = async () => {');
const endIdx = content.indexOf('      setDashboardData(overview)', startIdx);
const catchEndIdx = content.indexOf('    }', endIdx);
const targetBlock = content.substring(startIdx, catchEndIdx + 5);

const replacement = `  const translateNotification = (title: string, content: string, type: string) => {
    const t = (type || '').toLowerCase();
    const lowerTitle = (title || '').toLowerCase();

    let viTitle = title;
    let viContent = content;

    if (t === 'manuscript_submitted' || t === 'series_submitted' || lowerTitle.includes('manuscript submitted') || lowerTitle.includes('nộp bản thảo')) {
      viTitle = 'Cập nhật mới';
      viContent = content || 'Tác giả đã nộp bản thảo mới cần duyệt.';
    } else if (t === 'editor_feedback' || lowerTitle.includes('feedback') || lowerTitle.includes('nhận xét')) {
      viTitle = 'Ý kiến thảo luận';
      viContent = content || 'Có thảo luận hoặc ý kiến phản hồi mới.';
    } else if (t === 'task_submitted' || lowerTitle.includes('submission')) {
      viTitle = 'Trợ lý nộp bài';
      viContent = content || 'Trợ lý đã nộp bản thảo/bản vẽ mới.';
    } else if (t === 'vote_cast' || t.includes('vote') || lowerTitle.includes('vote')) {
      viTitle = 'Đóng góp ý kiến của Hội đồng';
      viContent = content || 'Thành viên Hội đồng đã bỏ phiếu duyệt.';
    } else if (t === 'decision_result' || lowerTitle.includes('decision')) {
      viTitle = 'Kết quả kiểm duyệt Hội đồng';
      viContent = content || 'Hội đồng biên tập đã phản hồi báo cáo của bạn.';
    }

    return { title: viTitle, content: viContent };
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const [overviewRes, seriesRes, manuscriptsRes, notificationsRes] = await Promise.all([
        editorService.getDashboardOverview(),
        editorService.getSeries(),
        editorService.getManuscripts().catch(() => ({ data: [] })),
        editorService.getNotifications().catch(() => ({ data: [] }))
      ])

      const overview = overviewRes.data || overviewRes
      
      // Calculate active series count
      const seriesData = seriesRes.data || seriesRes
      const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData.series || seriesData.items || [])
      const activeSeries = seriesList.filter((s: any) => ['published', 'approved', 'in_production', 'hidden', 'archived'].includes(s.status))
      overview.active_series_count = activeSeries.length
      overview.active_publishing_count = activeSeries.filter((s: any) => s.status === 'published').length
      overview.active_paused_count = activeSeries.filter((s: any) => ['hidden', 'archived'].includes(s.status)).length

      // Calculate actual pending review manuscripts
      const manuscriptsData = manuscriptsRes.data || manuscriptsRes
      const manuscriptsList = Array.isArray(manuscriptsData) ? manuscriptsData : (manuscriptsData.manuscripts || manuscriptsData.items || [])
      const pendingManuscripts = manuscriptsList.filter((m: any) => ['submitted', 'in_review'].includes(m.status?.toLowerCase()))
      const revisionManuscripts = manuscriptsList.filter((m: any) => ['needs_revision', 'rejected'].includes(m.status?.toLowerCase()))

      overview.actual_pending_review = pendingManuscripts.length
      overview.actual_need_revision = revisionManuscripts.length

      // Process notifications
      const notificationsData = notificationsRes.data || notificationsRes
      const notificationsList = Array.isArray(notificationsData) ? notificationsData : (notificationsData.notifications || notificationsData.items || [])
      
      const mappedNotifications = notificationsList.map((n: any) => {
        const { title, content } = translateNotification(n.title, n.content || '', n.type)
        return {
          ...n,
          title,
          content
        }
      })

      overview.recent_notifications = mappedNotifications

      setDashboardData(overview)
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }`;

content = content.replace(targetBlock, replacement);

// 2. Update recentNotifications declaration (make it include all, both read and unread)
const oldNotifDecl = `  const recentNotifications = (dashboardData?.recentNotifications || dashboardData?.recent_notifications || []).filter((n: any) => !n.is_read)`;
const newNotifDecl = `  const recentNotifications = (dashboardData?.recentNotifications || dashboardData?.recent_notifications || [])`;

if (!content.includes(oldNotifDecl)) {
  console.error("Could not find oldNotifDecl!");
  process.exit(1);
}
content = content.replace(oldNotifDecl, newNotifDecl);

// 3. Update the JSX card design for read vs unread notifications
const oldJsxMap = `            {recentNotifications.length > 0 ? recentNotifications.slice(0, 6).map((notif: any, idx: number) => (
              <div 
                key={notif.notification_id || notif.id || idx} 
                onClick={() => handleNotifClick(notif)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >`;

const newJsxMap = `            {recentNotifications.length > 0 ? recentNotifications.slice(0, 6).map((notif: any, idx: number) => (
              <div 
                key={notif.notification_id || notif.id || idx} 
                onClick={() => handleNotifClick(notif)}
                className={\`p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative \${
                  notif.is_read ? 'opacity-70 bg-gray-50/50' : 'bg-white border-l-4 border-l-red-500'
                }\`}
              >`;

if (!content.includes(oldJsxMap)) {
  console.error("Could not find oldJsxMap!");
  process.exit(1);
}
content = content.replace(oldJsxMap, newJsxMap);

// 4. Update the unread count badge condition
const oldBadge = `              {recentNotifications.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">{recentNotifications.filter((n: any) => !n.is_read).length || recentNotifications.length} CHƯA ĐỌC</span>
              )}`;

const newBadge = `              {recentNotifications.filter((n: any) => !n.is_read).length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">{recentNotifications.filter((n: any) => !n.is_read).length} CHƯA ĐỌC</span>
              )}`;

if (!content.includes(oldBadge)) {
  console.error("Could not find oldBadge!");
  process.exit(1);
}
content = content.replace(oldBadge, newBadge);

// Convert back to CRLF before writing
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(targetFile, content, 'utf8');
console.log("SUCCESSFULLY UPDATED ALL NOTIFICATION LOGIC!");
