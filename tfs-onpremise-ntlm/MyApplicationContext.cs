using System;
using System.Diagnostics;
using TfsOnPremiseNtlm.Properties;
using Swf = System.Windows.Forms;

namespace TfsOnPremiseNtlm
{
    public class MyApplicationContext : Swf.ApplicationContext
    {
        private Swf.NotifyIcon trayIconSwf;

        public MyApplicationContext()
        {
            // Initialize Tray Icon
            TraySwf();
        }


        private void TraySwf()
        {
            trayIconSwf = new Swf.NotifyIcon()
            {
                Icon = Resources.PerfCenterCpl,
                Text = Program.Title,
                ContextMenu = new Swf.ContextMenu(new Swf.MenuItem[] {
                    new Swf.MenuItem("Open", Open) { DefaultItem = true },
                    new Swf.MenuItem("Exit", Exit)
                }),
                Visible = true
            };
            trayIconSwf.DoubleClick += Open;
            trayIconSwf.Visible = false;
            Swf.Application.DoEvents();
            trayIconSwf.Visible = true;
        }

        void Exit(object sender, EventArgs e)
        {
            // Hide tray icon, otherwise it will remain shown until user mouses over it
            if (trayIconSwf != null)
                trayIconSwf.Visible = false;

            if (Program.server != null)
                Program.server.Dispose();
            Swf.Application.Exit();
        }

        void Open(object sender, EventArgs e)
        {
            Process.Start(new ProcessStartInfo()
            {
                FileName = Program.BaseUrl + "/",
                UseShellExecute = true
            });
        }
    }
}
